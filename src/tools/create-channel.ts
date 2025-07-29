import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function createChannelTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_create_channel',
    description: 'Create a new Slack channel',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Channel name (must be lowercase, can contain hyphens and underscores)',
        },
        is_private: {
          type: 'boolean',
          description: 'Whether this is a private channel (default false)',
          default: false,
        },
      },
      required: ['name'],
    },
    handler: async (args) => {
      const { name, is_private = false } = args;
      
      // Validate channel name format
      if (!/^[a-z0-9_-]+$/.test(name)) {
        throw new Error('Channel name can only contain lowercase letters, numbers, hyphens and underscores');
      }

      const response = await slackClient.createChannel({
        name,
        is_private,
      });

      if (!response.ok) {
        throw new Error(`Failed to create channel: ${response.error}`);
      }

      return {
        success: true,
        channel: {
          id: response.channel?.id,
          name: response.channel?.name,
          is_private: response.channel?.is_private,
          created: response.channel?.created,
        },
        message: `Channel #${name} created successfully`,
      };
    },
  };
} 