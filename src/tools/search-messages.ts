import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function searchMessagesTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_search_messages',
    description: '在 Slack 工作空間中搜尋訊息',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜尋關鍵字或查詢表達式',
        },
        count: {
          type: 'number',
          description: '返回的結果數量（預設 20）',
          default: 20,
        },
        page: {
          type: 'number',
          description: '結果頁數（預設 1）',
          default: 1,
        },
      },
      required: ['query'],
    },
    handler: async (args) => {
      const { query, count = 20, page = 1 } = args;
      
      const response = await slackClient.searchMessages(query, {
        count,
        page,
      });

      if (!response.ok) {
        throw new Error(`搜尋訊息失敗: ${response.error}`);
      }

      const messages = response.messages?.matches?.map(match => ({
        text: match.text,
        user: match.user,
        username: match.username,
        ts: match.ts,
        channel: {
          id: match.channel?.id,
          name: match.channel?.name,
        },
        permalink: match.permalink,
      })) || [];

      return {
        success: true,
        query,
        messages,
        total: response.messages?.total || 0,
        page,
        page_count: Math.ceil((response.messages?.total || 0) / count),
      };
    },
  };
} 