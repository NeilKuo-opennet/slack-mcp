import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function inviteToChannelTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_invite_to_channel',
    description: '邀請用戶加入 Slack 頻道',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: '頻道 ID 或名稱',
        },
        users: {
          type: 'string',
          description: '用戶 ID，多個用戶用逗號分隔',
        },
      },
      required: ['channel', 'users'],
    },
    handler: async (args) => {
      const { channel, users } = args;
      
      const response = await slackClient.inviteToChannel({
        channel,
        users,
      });

      if (!response.ok) {
        throw new Error(`邀請用戶失敗: ${response.error}`);
      }

      const userIds = users.split(',').map(id => id.trim());

      return {
        success: true,
        channel: response.channel?.id,
        invited_users: userIds,
        message: `成功邀請 ${userIds.length} 位用戶加入頻道`,
      };
    },
  };
} 