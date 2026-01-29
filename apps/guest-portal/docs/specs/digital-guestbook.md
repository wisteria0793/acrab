# Digital Guestbook (デジタルゲストブック) 仕様案

## 1. 概要 (Overview)
紙の「旅の思い出帳」をデジタル化した機能。宿泊したゲストが、旅の思い出、おすすめの周辺スポット、宿への感想を投稿・閲覧できる。
**「旅のコミュニティ」**を形成し、次のゲストへの有益な情報源とすることで、満足度向上とリピート率向上を狙う。

## 2. ユーザー体験 (User Experience)

### 閲覧 (View)
*   ダッシュボードに「Guestbook」カードを表示。
*   タップするとタイムライン形式（またはグリッド形式）で過去の投稿が見られる。
*   **多言語自動翻訳**: 英語の投稿を日本語で読むなど、AIによる翻訳ボタンを設置。
*   **フィルタリング**: 「食事」「観光」「宿の感想」などのタグで絞り込み。

### 投稿 (Post)
*   チェックアウト前、またはチェックアウト後のサンクスメールから投稿可能。
*   **内容**:
    *   テキスト（必須）
    *   写真（任意/最大3枚）
    *   タグ選択（「美味しいもの」「絶景」「リラックス」など）
    *   評価（5段階スター）
*   **AIアシスト**: 投稿文の推敲や、ポジティブな表現へのリライト提案（オプション）。

## 3. 技術実装 (Implementation Details)

### データモデル (Schema)
Prisma / PostgreSQL を想定。

```prisma
model GuestbookEntry {
  id        String   @id @default(cuid())
  userId    String   // 投稿者ID (Guest)
  content   String   // 本文
  images    String[] // 画像URL配列
  rating    Int?     // 1-5
  tags      String[] // タグ
  isPublic  Boolean  @default(false) // 承認制にする場合のフラグ
  createdAt DateTime @default(now())
  
  // 多言語対応用
  language  String   @default("ja") // 投稿時の言語
}
```

### フロントエンド (UI Components)
1.  **`GuestbookList`**: Masonry Layout（Pinterest風）を採用し、写真とテキストをオシャレに配置。
2.  **`EntryCard`**: 個々の投稿表示。フリップアニメーションで裏面に翻訳を表示するなどのギミック。
3.  **`ComposeModal`**: 投稿フォーム。カメラロールからのアップロード機能。

### AI連携 (Integration)
*   **自動翻訳**: 表示時にOpenAI API (GPT-4o mini) を叩いて、ユーザーの母国語に変換。
*   **モデレーション**: 投稿時に不適切なコンテンツ（誹謗中傷、個人情報）が含まれていないかAIがチェックし、問題があれば管理者承認待ちにする。

### 管理画面 (Admin)
*   投稿の削除・非表示機能。
*   「オーナーからの返信」機能。

## 4. 開発ロードマップ案
1.  **Phase 1 (MVP)**: テキスト投稿のみ、一覧表示。DB連携なし（Mockデータ）。
2.  **Phase 2**: DB実装、写真アップロード機能。
3.  **Phase 3**: AI自動翻訳、モデレーション機能。
