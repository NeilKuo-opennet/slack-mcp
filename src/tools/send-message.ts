import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function sendMessageTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_send_message',
    description: 'Send a message to a Slack channel or user',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel ID or name (e.g. #general) or user ID',
        },
        text: {
          type: 'string',
          description: 'Message content to send',
        },
        thread_ts: {
          type: 'string',
          description: 'Timestamp of the message to reply to (optional)',
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
        message: response.ok ? 'Message sent successfully' : 'Failed to send message',
        timestamp: response.ts,
        channel: response.channel,
      };
    },
  };
} 