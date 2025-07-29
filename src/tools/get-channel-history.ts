import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function getChannelHistoryTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_get_channel_history',
    description: 'Get message history from a Slack channel',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel ID or name',
        },
        limit: {
          type: 'number',
          description: 'Limit the number of messages returned (default 50)',
          default: 50,
        },
        oldest: {
          type: 'string',
          description: 'Timestamp of the oldest message (optional)',
        },
        latest: {
          type: 'string',
          description: 'Timestamp of the latest message (optional)',
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
        throw new Error(`Failed to get channel history: ${response.error}`);
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