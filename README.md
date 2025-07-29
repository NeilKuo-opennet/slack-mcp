# Slack MCP Server

A Model Context Protocol (MCP) server that provides seamless Slack integration for AI assistants. This server enables AI models to interact with Slack workspaces through a comprehensive set of tools for messaging, channel management, and user interactions.

## 🚀 Features

### Core Slack Tools
- **Message Management**: Send messages to channels and users
- **Channel Operations**: List channels and retrieve message history
- **User Management**: Get workspace user information
- **Message Search**: Search across workspace messages
- **Custom Tools**: Specialized tools for specific workflows

### Special Features
- **Smart Workday Calculation**: Automatically reads messages from the previous workday
- **User-Specific Filtering**: Dedicated tool for reading specific user messages
- **Rich Message Information**: Includes user details, timestamps, and thread information
- **Flexible Time Ranges**: Support for custom date ranges and all-time searches

## 📋 Available Tools

| Tool Name | Description |
|-----------|-------------|
| `slack_send_message` | Send messages to channels or users |
| `slack_get_channels` | Get list of workspace channels |
| `slack_get_users` | Get list of workspace users |
| `slack_get_channel_history` | Retrieve channel message history |
| `slack_search_messages` | Search messages across workspace |
| `read_frontend_ladisai_messages` | **Special**: Read Neil Kuo's messages from frontend-ladisai channel |

## 🛠️ Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Slack Bot Token with appropriate permissions

### Setup

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd slack-mcp
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Required: Slack Bot Token from https://api.slack.com/apps
```

### Slack Bot Permissions

Your Slack Bot needs the following OAuth scopes:

#### Required Scopes
- `channels:read` - Read public channels
- `channels:history` - Read channel message history
- `groups:read` - Read private channels
- `groups:history` - Read private channel history
- `users:read` - Read user information
- `chat:write` - Send messages
- `search:read` - Search messages

#### Optional Scopes
- `channels:manage` - Create channels (if using channel creation tools)
- `groups:write` - Manage private channels

### MCP Configuration

Add to your MCP client configuration (e.g., Cursor's `mcp.json`):

```json
{
  "mcpServers": {
    "slack-mcp": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/slack-mcp",
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-slack-bot-token-here"
      }
    }
  }
}
```

## 🎯 Usage Examples

### Basic Message Sending
```typescript
// Send a message to a channel
{
  "tool": "slack_send_message",
  "parameters": {
    "channel": "general",
    "text": "Hello from MCP!"
  }
}

// Send a direct message to a user
{
  "tool": "slack_send_message",
  "parameters": {
    "channel": "U1234567890",
    "text": "Private message"
  }
}
```

### Reading Channel History
```typescript
// Get recent messages from a channel
{
  "tool": "slack_get_channel_history",
  "parameters": {
    "channel": "frontend-ladisai",
    "limit": 10
  }
}
```

### Special: Reading Neil Kuo's Messages
```typescript
// Get Neil Kuo's latest messages (automatic workday detection)
{
  "tool": "read_frontend_ladisai_messages",
  "parameters": {
    "max_results": 5
  }
}

// Get all-time latest messages
{
  "tool": "read_frontend_ladisai_messages",
  "parameters": {
    "all_time": true,
    "max_results": 10
  }
}

// Get messages from a specific date
{
  "tool": "read_frontend_ladisai_messages",
  "parameters": {
    "manual_date": "2025-01-27",
    "max_results": 5
  }
}
```

### User and Channel Information
```typescript
// List all users
{
  "tool": "slack_get_users",
  "parameters": {
    "limit": 100
  }
}

// List all channels
{
  "tool": "slack_get_channels",
  "parameters": {
    "exclude_archived": true
  }
}
```

## 🔧 Development

### Scripts
- `npm run build` - Build the TypeScript project
- `npm run dev` - Build and watch for changes
- `npm start` - Start the MCP server
- `npm run typecheck` - Run TypeScript type checking

### Project Structure
```
slack-mcp/
├── src/
│   ├── index.ts              # Main MCP server
│   ├── slack-client.ts       # Slack API client wrapper
│   └── tools/
│       ├── index.ts          # Tool registry
│       ├── send-message.ts   # Message sending tool
│       ├── get-channels.ts   # Channel listing tool
│       ├── get-users.ts      # User listing tool
│       ├── get-channel-history.ts  # Channel history tool
│       ├── search-messages.ts      # Message search tool
│       └── read-frontend-ladisai.ts # Custom Neil Kuo reader
├── dist/                     # Compiled JavaScript
├── package.json
└── README.md
```

## 🔍 Smart Workday Logic

The `read_frontend_ladisai_messages` tool includes intelligent workday calculation:

- **Monday** → Reads Friday's messages (3 days back)
- **Tuesday** → Reads Monday's messages (1 day back)
- **Wednesday** → Reads Tuesday's messages (1 day back)
- **Thursday** → Reads Wednesday's messages (1 day back)
- **Friday** → Reads Thursday's messages (1 day back)
- **Saturday** → Reads Friday's messages (1 day back)
- **Sunday** → Reads Friday's messages (2 days back)

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to get channel list"**
   - Check if your bot has `channels:read` permission
   - Ensure the bot is added to the workspace

2. **"Failed to get channel history"**
   - Verify the bot has `channels:history` permission
   - Check if the bot is invited to the specific channel

3. **"Message sent successfully" but no message appears**
   - Confirm the bot has `chat:write` permission
   - Verify the channel name/ID is correct

4. **MCP server not responding**
   - Check if the build was successful: `npm run build`
   - Verify environment variables are set correctly
   - Restart your MCP client (e.g., Cursor)

### Testing the Server
```bash
# Test if the server responds to tool list requests
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | node dist/index.js
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review Slack API documentation
- Check MCP protocol specifications

---

**Note**: This MCP server is optimized for the frontend-ladisai channel workflow and includes specialized tools for reading Neil Kuo's messages with smart workday detection. 