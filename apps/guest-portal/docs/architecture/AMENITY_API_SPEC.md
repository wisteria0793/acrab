# アメニティリクエストAPI仕様書 (Amenity Request API Specs)

## エンドポイント
`POST /api/amenities/requests/`

## 概要
ゲストがアメニティをリクエストするためのエンドポイントです。

## リクエストボディ (JSON)

| パラメータ名 | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| `reservation_id` | integer | Yes | 予約ID |
| `items` | array | Yes | リクエストするアメニティのリスト |
| `note` | string | No | 特記事項（「急ぎでお願いします」など） |

### `items` 配列の構造

| パラメータ名 | 型 | 必須 | 説明 |
| :--- | :--- | :--- | :--- |
| `amenity_id` | integer | Yes | アメニティのマスタID |
| `quantity` | integer | Yes | 数量 (`1` 以上) |

### リクエスト例

```json
{
  "reservation_id": 12345,
  "items": [
    {
      "amenity_id": 1,
      "quantity": 2
    },
    {
      "amenity_id": 2,
      "quantity": 1
    }
  ],
  "note": "玄関前に置いておいてください"
}
```

## レスポンス例 (JSON)

```json
{
  "id": 67890,
  "reservation_id": 12345,
  "status": "pending",
  "requested_at": "2024-01-01T12:00:00Z",
  "items": [
    {
      "amenity_name": "Toothbrush",
      "quantity": 2
    },
    {
      "amenity_name": "Towel",
      "quantity": 1
    }
  ],
  "note": "玄関前に置いておいてください"
}
```
