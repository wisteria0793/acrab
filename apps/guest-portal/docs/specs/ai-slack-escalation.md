# AI Chat Escalation to Slack仕様案

## 1. 概要 (Overview)
ゲストからの問い合わせに対し、AI（OpenAI）が回答できない場合、または緊急性を要すると判断した場合に、Slackのスタッフ用チャネルに通知を飛ばす機能。
スタッフはSlack通知を見て、現場へ向かうか、直接対応を行う。

## 2. ワークフロー (Workflow)

1.  **AI判定**:
    *   ユーザーの発言をAIが解析。
    *   AIのSystem Promptに「回答できない場合、または緊急の場合は `{ escalate: true, summary: "..." }` というJSONを返せ」と指示。
2.  **エスカレーション検知**:
    *   APIルート (`/api/chat`) でAIのレスポンスを監視。
    *   `escalate: true` を検知したら、Slack通知処理をキック。
3.  **Slack通知**:
    *   Incoming Webhook、またはSlack Web API (`chat.postMessage`) を使用。
    *   **通知内容**:
        *   部屋番号 (Booking ID)
        *   ゲスト名
        *   問い合わせ要約
        *   会話ログの直近3件
4.  **スタッフ対応**:
    *   Slackを見たスタッフが対応。
    *   （Optional）Slackのスレッドで返信した内容を、AI経由でゲストに返す機能（Phase 2）。

## 3. 技術仕様 (Technical Specs)

### Slack Integration
*   **Method**: Incoming Webhook (今回は通知のみなのでこれで十分)。
*   **Payload**:
```json
{
  "text": "🚨 ゲストからの緊急問い合わせ (Room 101)",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Room 101 (Suzuki)* からエスカレーションされました。\n\n> 部屋の鍵が開きません。至急来てください。"
      }
    }
  ]
}
```

### Next.js API Route (`src/app/api/chat/route.ts`)
*   環境変数 `SLACK_WEBHOOK_URL` を追加。
*   OpenAIへのFunction Calling定義に `escalateToStaff` 関数を追加し、AIが明確に意思表示できるようにする。

## 4. メリット
*   **専用アプリ不要**: スタッフは使い慣れたSlackで通知を受け取れる。
*   **即時性**: Push通知が確実に届く。
*   **開発コスト低**: Webhookを叩くだけなので数時間で実装可能。
