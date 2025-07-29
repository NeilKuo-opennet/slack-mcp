# Slack MCP

一個簡單的 Model Context Protocol (MCP) 伺服器，用於 Slack 整合。

## 功能

- 🚀 發送訊息到頻道或用戶
- 📋 獲取頻道和用戶列表  
- 📜 讀取頻道歷史訊息
- 🔍 搜尋工作空間訊息
- ⚙️ 創建頻道和邀請用戶

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置 Slack App

1. 前往 [Slack API](https://api.slack.com/apps) 創建新的 Slack App
2. 在 **OAuth & Permissions** 添加以下 Bot Token Scopes:
   - `chat:write` - 發送訊息
   - `channels:read` - 讀取頻道資訊
   - `channels:history` - 讀取頻道歷史
   - `users:read` - 讀取用戶資訊
   - `search:read` - 搜尋訊息
   - `channels:manage` - 管理頻道
   - `groups:read` - 讀取私人頻道

3. 安裝 App 到你的工作空間
4. 複製 **Bot User OAuth Token**

### 3. 配置環境變數

```bash
cp .env.example .env
```

編輯 `.env` 文件，設置你的 Slack Bot Token：

```env
SLACK_BOT_TOKEN=xoxb-your-actual-bot-token
```

### 4. 建構和運行

```bash
# 開發模式（自動重新建構）
npm run dev

# 或建構後運行
npm run build
npm start
```

## MCP 工具

### 基本訊息操作

- `slack_send_message` - 發送訊息到頻道或用戶
- `slack_get_channel_history` - 獲取頻道歷史訊息
- `slack_search_messages` - 搜尋工作空間訊息

### 資訊查詢

- `slack_get_channels` - 獲取頻道列表
- `slack_get_users` - 獲取用戶列表

### 管理操作

- `slack_create_channel` - 創建新頻道
- `slack_invite_to_channel` - 邀請用戶到頻道

## 使用範例

### 發送訊息
```json
{
  "tool": "slack_send_message",
  "arguments": {
    "channel": "#general",
    "text": "Hello from MCP!"
  }
}
```

### 搜尋訊息
```json
{
  "tool": "slack_search_messages", 
  "arguments": {
    "query": "meeting notes",
    "count": 10
  }
}
```

## 技術棧

- **Runtime**: Node.js 18+
- **語言**: TypeScript
- **建構工具**: tsup
- **Slack SDK**: @slack/web-api
- **MCP SDK**: @modelcontextprotocol/sdk

## 開發

```bash
# 類型檢查
npm run typecheck

# 監視模式建構
npm run dev

# 一次性建構
npm run build
```

## 貢獻

歡迎 Pull Requests 和 Issues！

## 授權

MIT License 