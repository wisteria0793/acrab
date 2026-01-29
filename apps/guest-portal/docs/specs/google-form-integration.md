# Googleフォーム統合戦略

## 概要
開発コストを最小限に抑え、既存の業務フローを活用するため、宿泊者名簿（レジスターカード）の入力プロセスをGoogleフォームに移行します。ゲストポータルはユーザーをフォームへ誘導し、API経由で入力完了を確認してから決済へ進みます。

## アーキテクチャ

```mermaid
sequenceDiagram
    participant User as ゲスト
    participant App as ゲストポータル
    participant GForm as Googleフォーム
    participant GAS as Googleスプレッドシート (GAS)
    participant API as バックエンド (Django)

    Note over User, App: 1. 本人確認 (Identify) & 予約確認 (Verify) 完了

    App->>User: 「名簿入力フォームを開く」ボタンを表示
    User->>GForm: Googleフォームを開く (別タブ)
    Note right of User: URLパラメータで予約IDを連携<br/>例: ?entry.12345=RES_ID

    User->>GForm: 個人情報入力 & パスポートアップロード
    GForm-->>User: 送信完了画面
    
    GForm->>GAS: スプレッドシートに行を追加
    GAS->>API: Webhook送信 (予約ID + ステータス)
    API->>API: 予約ステータスを「名簿入力済」に更新

    User->>App: アプリのタブに戻る
    User->>App: 「入力完了」ボタンを押す
    App->>API: ステータス確認
    
    alt ステータス != 完了
        API-->>App: ステータス: 未完
        App-->>User: 「確認できませんでした。少々お待ちいただくか再試行してください」
    else ステータス == 完了
        API-->>App: ステータス: 完了
        App->>User: 決済 (Payment) 画面へ遷移
    end
```

## 実装詳細

### フロントエンド (ゲストポータル)
- **名簿入力ステップ (Register Step)**:
    - 既存の入力フォームを削除。
    - 「登録フォームへ移動」する外部リンクボタンを追加。
    - GoogleフォームのURLに予約IDをプレフィルパラメータとして付与。
    - ステータスをポーリング/確認するための「完了確認」ボタンを追加。

### バックエンド (Django) - *今後実装予定*
- **Webhook エンドポイント**: GASからのペイロードを受信する。
- **ステータス API**: 現在のフラグ `is_guest_info_submitted` を返す。

### Google 側 (GAS)
- **トリガー**: フォーム送信時。
- **スクリプト**: DjangoのWebhookに対して予約IDを含むHTTP POSTリクエストを送信する。
