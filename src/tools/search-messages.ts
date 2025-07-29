import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function searchMessagesTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_search_messages',
    description: 'Search for messages in the Slack workspace',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keywords or query expression',
        },
        count: {
          type: 'number',
          description: 'Number of results to return (default 20)',
          default: 20,
        },
        page: {
          type: 'number',
          description: 'Page number of results (default 1)',
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
        throw new Error(`Failed to search messages: ${response.error}`);
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