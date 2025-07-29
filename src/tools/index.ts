import type { SlackClient } from '../slack-client.js';
import { sendMessageTool } from './send-message.js';
import { getChannelsTool } from './get-channels.js';
import { getUsersTool } from './get-users.js';
import { getChannelHistoryTool } from './get-channel-history.js';
import { createChannelTool } from './create-channel.js';
import { inviteToChannelTool } from './invite-to-channel.js';
import { searchMessagesTool } from './search-messages.js';

export interface SlackTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: Record<string, any>) => Promise<any>;
}

/**
 * 創建所有 Slack 工具
 */
export function createSlackTools(slackClient: SlackClient): SlackTool[] {
  return [
    sendMessageTool(slackClient),
    getChannelsTool(slackClient),
    getUsersTool(slackClient),
    getChannelHistoryTool(slackClient),
    createChannelTool(slackClient),
    inviteToChannelTool(slackClient),
    searchMessagesTool(slackClient),
  ];
} 