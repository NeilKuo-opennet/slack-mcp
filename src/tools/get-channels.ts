import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

export function getChannelsTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'slack_get_channels',
    description: '獲取 Slack 工作空間的頻道列表',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: '返回的頻道數量限制（預設 100）',
          default: 100,
        },
        exclude_archived: {
          type: 'boolean',
          description: '是否排除已封存的頻道（預設 true）',
          default: true,
        },
        types: {
          type: 'string',
          description: '頻道類型過濾（如 public_channel,private_channel）',
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
        throw new Error(`獲取頻道列表失敗: ${response.error}`);
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