import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function inviteToChannelTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_invite_to_channel',
    description: 'Invite users to join a Slack channel',
    inputSchema: {
      type: 'object',
      properties: {
        channel: {
          type: 'string',
          description: 'Channel ID or name',
        },
        users: {
          type: 'string',
          description: 'User IDs, separated by commas for multiple users',
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
        throw new Error(`Failed to invite users: ${response.error}`);
      }

      const userIds = users.split(',').map((id: string) => id.trim());

      return {
        success: true,
        channel: response.channel?.id,
        invited_users: userIds,
        message: `Successfully invited ${userIds.length} user(s) to channel`,
      };
    },
  };
} 