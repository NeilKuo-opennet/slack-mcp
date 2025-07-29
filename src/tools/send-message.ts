import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function sendMessageTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_send_message',
    description: '發送訊息到 Slack 頻道或用戶',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: '頻道 ID 或名稱（如 #general）或用戶 ID',
        },
        text: {
          type: 'string',
          description: '要發送的訊息內容',
        },
        thread_ts: {
          type: 'string',
          description: '回覆特定訊息的時間戳（可選）',
        },
      },
      required: ['channel', 'text'],
    },
    handler: async (args) => {
      const { channel, text, thread_ts } = args;
      
      const response = await slackClient.sendMessage({
        channel,
        text,
        thread_ts,
      });

      return {
        success: response.ok,
        message: response.ok ? '訊息發送成功' : '訊息發送失敗',
        timestamp: response.ts,
        channel: response.channel,
      };
    },
  };
} 