import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function createChannelTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_create_channel',
    description: '創建新的 Slack 頻道',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '頻道名稱（必須小寫，可以包含連字符和底線）',
        },
        is_private: {
          type: 'boolean',
          description: '是否為私人頻道（預設 false）',
          default: false,
        },
      },
      required: ['name'],
    },
    handler: async (args) => {
      const { name, is_private = false } = args;
      
      // 驗證頻道名稱格式
      if (!/^[a-z0-9_-]+$/.test(name)) {
        throw new Error('頻道名稱只能包含小寫字母、數字、連字符和底線');
      }

      const response = await slackClient.createChannel({
        name,
        is_private,
      });

      if (!response.ok) {
        throw new Error(`創建頻道失敗: ${response.error}`);
      }

      return {
        success: true,
        channel: {
          id: response.channel?.id,
          name: response.channel?.name,
          is_private: response.channel?.is_private,
          created: response.channel?.created,
        },
        message: `頻道 #${name} 創建成功`,
      };
    },
  };
} 