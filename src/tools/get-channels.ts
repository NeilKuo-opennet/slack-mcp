import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function getChannelsTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_get_channels',
    description: 'Get a list of channels in the Slack workspace',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Limit the number of channels returned (default 100)',
          default: 100,
        },
        exclude_archived: {
          type: 'boolean',
          description: 'Whether to exclude archived channels (default true)',
          default: true,
        },
        types: {
          type: 'string',
          description: 'Channel types to filter (e.g. public_channel,private_channel)',
          default: 'public_channel,private_channel',
        },
      },
    },
    handler: async (args) => {
      const { limit = 100, exclude_archived = true, types = 'public_channel,private_channel' } = args;
      
      const response = await slackClient.getChannels({
        limit,
        exclude_archived,
        types,
      });

      if (!response.ok) {
        throw new Error(`Failed to get channel list: ${response.error}`);
      }

      const channels = response.channels?.map(channel => ({
        id: channel.id,
        name: channel.name,
        is_private: channel.is_private,
        is_archived: channel.is_archived,
        member_count: channel.num_members,
        purpose: channel.purpose?.value,
        topic: channel.topic?.value,
      })) || [];

      return {
        success: true,
        channels,
        total: channels.length,
      };
    },
  };
} 