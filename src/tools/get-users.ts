import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function getUsersTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_get_users',
    description: '獲取 Slack 工作空間的用戶列表',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: '返回的用戶數量限制（預設 100）',
          default: 100,
        },
      },
    },
    handler: async (args) => {
      const { limit = 100 } = args;
      
      const response = await slackClient.getUsers({ limit });

      if (!response.ok) {
        throw new Error(`獲取用戶列表失敗: ${response.error}`);
      }

      const users = response.members?.map(member => ({
        id: member.id,
        name: member.name,
        real_name: member.real_name,
        display_name: member.profile?.display_name,
        email: member.profile?.email,
        is_bot: member.is_bot,
        is_admin: member.is_admin,
        is_owner: member.is_owner,
        deleted: member.deleted,
        status: member.profile?.status_text,
      })).filter(user => !user.deleted) || [];

      return {
        success: true,
        users,
        total: users.length,
      };
    },
  };
} 