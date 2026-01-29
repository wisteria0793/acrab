# Backend Implementation Guide (Django)

このドキュメントでは、フロントエンドの変更に対応するために必要なバックエンド（Django）の実装例を記載します。

## 1. Google フォーム (GAS) からの Webhook 受信

Google Apps Script (GAS) から送信される `reservation_id` を受け取り、予約ステータスを更新するAPIです。

### `views.py`

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Reservation
import logging

logger = logging.getLogger(__name__)

class GuestInfoWebhookView(APIView):
    """
    Google Form (GAS) からの完了通知を受け取る
    Payload例: { "reservation_id": 123, "status": "submitted" }
    """
    def post(self, request):
        reservation_id = request.data.get('reservation_id')
        
        if not reservation_id:
            return Response({"error": "reservation_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        reservation = get_object_or_404(Reservation, pk=reservation_id)
        
        # モデルに 'is_guest_info_submitted' フィールドなどのフラグがあると仮定
        # ない場合は status フィールドなどで代用
        reservation.status = 'checked_in_pending_payment' # 例: 名簿入力完了
        reservation.save()

        return Response({"message": "Status updated"}, status=status.HTTP_200_OK)
```

## 2. 予約の新規作成 (Walk-in / Direct Booking)

予約が見つからない場合や、OTAを通さない直接予約のために、フロントエンドから予約を作成するAPIが必要です。

### `views.py`

```python
from rest_framework import generics
# import serializers

class ReservationCreateView(generics.CreateAPIView):
    """
    予約作成API
    POST /api/reservations/
    """
    queryset = Reservation.objects.all()
    # serializer_class = ReservationSerializer 
    
    # 実際の実装では Serializer を定義してください
    # def perform_create(self, serializer):
    #     serializer.save()
```

### `serializers.py` (例)

```python
from rest_framework import serializers
from .models import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['id', 'guest_name', 'check_in', 'check_out', 'guests', 'facility_id', 'accommodation_tax', 'is_paid']
        
    def create(self, validated_data):
        # 宿泊税の計算ロジックなどをここに含める場合があります
        # 例: defaults set accommodation_tax = 200 * guests
        validated_data['accommodation_tax'] = 200 * validated_data.get('guests', 1)
        return super().create(validated_data)
```

## 3. Stripe PaymentIntent の作成

フロントエンドの `PaymentStep` で「Stripe Elements」を表示するために、バックエンドで `PaymentIntent` を作成し、`client_secret` を返す必要があります。
テストモード (`mode='test'`) の場合、DB参照をスキップしてダミーの支払を作成します。

### `views.py`

```python
import stripe
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreatePaymentIntentView(APIView):
    """
    予約IDを受け取り、Stripeの決済インテントを作成して client_secret を返す
    """
    def post(self, request):
        mode = request.data.get('mode')
        reservation_id = request.data.get('reservation_id')
        
        # 1. テストモードのハンドリング
        if mode == 'test':
            logger.info("Test mode detected for CreatePaymentIntent")
            # DBを見に行かずにダミー値で作成
            try:
                # 宿泊税額（テスト用固定値）
                amount = 400 
                
                intent = stripe.PaymentIntent.create(
                    amount=amount,
                    currency='jpy',
                    metadata={'reservation_id': reservation_id or 'test_999', 'mode': 'test'},
                    automatic_payment_methods={'enabled': True},
                )
                return Response({'clientSecret': intent.client_secret})
            except Exception as e:
                logger.error(f"Stripe Error (Test Mode): {str(e)}", exc_info=True)
                return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)

        # 2. 通常モード (DB参照)
        try:
            reservation = get_object_or_404(Reservation, pk=reservation_id)
            amount = int(reservation.accommodation_tax)
            
            # 金額が0以下の場合はエラー、または即時完了などの制御が必要
            if amount <= 0:
                 return Response({'error': 'Amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency='jpy',
                metadata={'reservation_id': reservation.id},
                automatic_payment_methods={'enabled': True},
            )
            return Response({'clientSecret': intent.client_secret})
            
        except Reservation.DoesNotExist:
            logger.warning(f"Reservation not found: ID={reservation_id}")
            return Response({'error': 'Reservation not found'}, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            # 詳細なログを出力
            logger.error(f"Error creating payment intent: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
```

## 4. Stripe Webhook の受信 (決済完了通知)

Stripe側で決済が完了した際、非同期でサーバーに通知が来ます。これを受け取り、予約の `is_paid` を完了にします。
**注意**: セキュリティのため、必ず署名検証 (Signature Verification) を行ってください。

### `views.py`

```python
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return HttpResponse(status=400)

    # 決済成功イベントをハンドル
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # metadataから予約IDを取得
        reservation_id = payment_intent['metadata'].get('reservation_id')
        mode = payment_intent['metadata'].get('mode')
        
        if mode == 'test':
            logger.info(f"Webhook Test Mode: Payment Succeeded for ID={reservation_id}")
            return HttpResponse(status=200)

        if reservation_id:
            try:
                reservation = Reservation.objects.get(pk=reservation_id)
                reservation.is_paid = True
                reservation.save()
            except Reservation.DoesNotExist:
                logger.error(f"Webhook Error: Reservation ID {reservation_id} not found")
                pass

    return HttpResponse(status=200)
```

## 5. `urls.py` 設定例

```python
from django.urls import path
from .views import GuestInfoWebhookView, CreatePaymentIntentView, stripe_webhook, ReservationCreateView

urlpatterns = [
    # ... 他のURL
    path('api/webhook/guest-info/', GuestInfoWebhookView.as_view(), name='guest_info_webhook'),
    path('api/create-payment-intent/', CreatePaymentIntentView.as_view(), name='create_payment_intent'),
    path('api/webhook/stripe/', stripe_webhook, name='stripe_webhook'),
    path('api/reservations/', ReservationCreateView.as_view(), name='reservation_create'), # 新規追加
]
```
