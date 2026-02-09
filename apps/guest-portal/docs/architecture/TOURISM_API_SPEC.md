# 観光スポットAPI仕様書 (Tourism API Specs)

## エンドポイント
`GET /api/tourism/spots/`

## 概要
登録されている観光スポットの一覧を取得します。
管理画面用途と、ゲスト向け表示用途（公開のみ）で使い分けることができます。

## クエリパラメータ (Query Parameters)

| パラメータ名 | 型 | 必須 | デフォルト値 | 説明 |
| :--- | :--- | :--- | :--- | :--- |
| `page` | integer | No | 1 | ページ番号（ページネーション用） |
| `search` | string | No | - | キーワード検索（名称、説明、住所、タグ等） |
| `category` | string | No | - | カテゴリでフィルタリング (e.g., `gourmet`, `scenery`) |
| `published_only` | string | No | `false` | `true` を指定すると、**公開中 (`is_published=True`) のデータのみ**を返却します。 |

## リクエスト例

### 1. 管理画面用（全件取得）
全てのスポット（非公開含む）を取得します。

```http
GET /api/tourism/spots/
```

### 2. ゲスト用（公開中のみ取得）
公開設定されているスポットのみを取得します。ゲスト用アプリなどで使用します。

```http
GET /api/tourism/spots/?published_only=true
```

### 3. 検索と組み合わせる
「グルメ」カテゴリで、かつ公開中のものだけを検索する場合。

```http
GET /api/tourism/spots/?category=gourmet&published_only=true
```

## レスポンス例 (JSON)

```json
{
    "count": 10,
    "next": "http://localhost:8000/api/tourism/spots/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "函館山",
            "name_en": "Mount Hakodate",
            "name_zh_cn": "函馆山",
            "name_zh_tw": "函館山",
            "name_ko": "하코다테산",
            "name_th": "ภูเขาฮาโกดาเตะ",
            "category": "scenery",
            "category_display": "風景",
            "description": "日本三大夜景の一つ...",
            "description_en": "One of the three best night views in Japan...",
            "description_zh_cn": "日本三大夜景之一...",
            "description_zh_tw": "日本三大夜景之一...",
            "description_ko": "일본 3대 야경 중 하나...",
            "description_th": "หนึ่งในสามวิวกลางคืนที่สวยที่สุดในญี่ปุ่น...",
            "map_url": "https://maps.google.com/...",
            "url": "https://334.co.jp/",
            "address": "北海道函館市函館山",
            "address_en": "Hakodateyama, Hakodate, Hokkaido",
            "address_zh_cn": "北海道函馆市函馆山",
            "address_zh_tw": "北海道函館市函館山",
            "address_ko": "홋카이도 하코다테시 하코다테야마",
            "address_th": "ฮาโกดาเตะยามะ ฮาโกดาเตะ ฮอกไกโด",
            "opening_hours": "10:00 - 22:00",
            "opening_hours_en": "10:00 AM - 10:00 PM",
            "tags": "夜景,ロープウェイ",
            "comment": "絶対に夜に行くべきです！",
            "comment_en": "You must go at night!",
            "is_published": true,
            "main_image": {
                "id": 10,
                "url": "http://localhost:8000/media/tourism/images/hakodate.jpg",
                "caption": "山頂からの眺め"
            },
            "images": [
                {
                    "id": 10,
                    "image": "/media/tourism/images/hakodate.jpg",
                    "caption": "山頂からの眺め",
                    "order": 0,
                    "is_main": true
                },
                {
                    "id": 11,
                    "image": "/media/tourism/images/ropeway.jpg",
                    "caption": "ロープウェイ",
                    "order": 1,
                    "is_main": false
                }
            ],
            "created_at": "2024-01-01T10:00:00Z",
            "updated_at": "2024-01-02T15:30:00Z"
        },
        ...
    ]
}
```

---

# フロントエンド実装ガイド (Frontend Implementation Guide)

ゲスト用アプリ（フロントエンド）からAPIを呼び出す際の実装例です。

## API関数の定義 (`src/api/tourism.js` の例)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // 環境変数等で管理

/**
 * 観光スポット一覧を取得する
 * @param {string} category - カテゴリフィルタ
 * @param {number} page - ページ番号
 * @param {string} search - 検索キーワード
 * @param {boolean} publishedOnly - 公開中のみ取得するかどうか (デフォルト: false)
 */
export const getTourismSpots = (category = '', page = 1, search = '', publishedOnly = false) => {
  const params = { page };
  if (category) params.category = category;
  if (search) params.search = search;
  
  // ゲスト用アプリでは true を渡す
  if (publishedOnly) params.published_only = 'true';

  return axios.get(`${API_URL}/api/tourism/spots/`, { params });
};
```

## コンポーネントでの使用例

```javascript
import React, { useEffect, useState } from 'react';
import { getTourismSpots } from '../api/tourism';

// ゲスト向けページでの呼び出し
const GuestPage = () => {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    const loadSpots = async () => {
      try {
        // 第4引数に true を渡して公開中のみ取得
        // 必要に応じて言語ごとのフィールドを表示 (例: spot.name_en)
        const response = await getTourismSpots('', 1, '', true);
        setSpots(response.data.results);
      } catch (error) {
        console.error(error);
      }
    };
    loadSpots();
  }, []);

  return (
    <div>
      {spots.map(spot => (
        <div key={spot.id}>
          {/* 言語切り替えロジックの例 */}
          <h2>{spot.name_en || spot.name}</h2>
          <p>{spot.description_en || spot.description}</p>
        </div>
      ))}
    </div>
  );
};
```