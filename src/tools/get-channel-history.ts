import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function getChannelHistoryTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_get_channel_history',
    description: '獲取 Slack 頻道的歷史訊息',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: '頻道 ID 或名稱',
        },
        limit: {
          type: 'number',
          description: '返回的訊息數量限制（預設 50）',
          default: 50,
        },
        oldest: {
          type: 'string',
          description: '最舊訊息的時間戳（可選）',
        },
        latest: {
          type: 'string',
          description: '最新訊息的時間戳（可選）',
        },
      },
      required: ['channel'],
    },
    handler: async (args) => {
      const { channel, limit = 50, oldest, latest } = args;
      
      const response = await slackClient.getChannelHistory({
        channel,
        limit,
        oldest,
        latest,
      });

      if (!response.ok) {
        throw new Error(`獲取頻道歷史失敗: ${response.error}`);
      }

      const messages = response.messages?.map(message => ({
        ts: message.ts,
        user: message.user,
        text: message.text,
        type: message.type,
        subtype: message.subtype,
        thread_ts: message.thread_ts,
        reply_count: message.reply_count,
        reactions: message.reactions?.map(reaction => ({
          name: reaction.name,
          count: reaction.count,
        })),
      })) || [];

      return {
        success: true,
        messages,
        total: messages.length,
        channel: channel,
      };
    },
  };
} 