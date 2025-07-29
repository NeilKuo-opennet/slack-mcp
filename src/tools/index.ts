import type { SlackClient } from '../slack-client.js';
import { sendMessageTool } from './send-message.js';
import { getChannelsTool } from './get-channels.js';
import { getUsersTool } from './get-users.js';
import { getChannelHistoryTool } from './get-channel-history.js';
import { searchMessagesTool } from './search-messages.js';
import { readFrontendLadisaiTool } from './read-frontend-ladisai.js';

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
 * Create all Slack tools
 */
export function createSlackTools(slackClient: SlackClient): SlackTool[] {
  return [
    sendMessageTool(slackClient),
    getChannelsTool(slackClient),
    getUsersTool(slackClient),
    getChannelHistoryTool(slackClient),
    searchMessagesTool(slackClient),
    readFrontendLadisaiTool(slackClient),
  ];
} 