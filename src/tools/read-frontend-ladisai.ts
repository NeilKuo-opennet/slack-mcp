import type { SlackClient } from '../slack-client.js';
import type { SlackTool } from './index.js';

function getPreviousWorkday(): { oldest: string; latest: string } {
  const now = new Date();
  const today = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let daysBack: number;

  // Calculate how many days back to get the previous workday
  switch (today) {
    case 1: // Monday -> get Friday (3 days back)
      daysBack = 3;
      break;
    case 0: // Sunday -> get Friday (2 days back)
      daysBack = 2;
      break;
    case 6: // Saturday -> get Friday (1 day back)
      daysBack = 1;
      break;
    default: // Tuesday-Friday -> get previous day (1 day back)
      daysBack = 1;
      break;
  }

  const previousWorkday = new Date(now);
  previousWorkday.setDate(now.getDate() - daysBack);
  
  // Set to start of that day (00:00:00)
  const startOfDay = new Date(previousWorkday);
  startOfDay.setHours(0, 0, 0, 0);
  
  // Set to end of that day (23:59:59)
  const endOfDay = new Date(previousWorkday);
  endOfDay.setHours(23, 59, 59, 999);

  return {
    oldest: (startOfDay.getTime() / 1000).toString(),
    latest: (endOfDay.getTime() / 1000).toString()
  };
}

function getWorkdayName(daysBack: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() - daysBack);
  return days[targetDate.getDay()];
}

export function readFrontendLadisaiTool(slackClient: SlackClient): SlackTool {
  return {
    name: 'read_frontend_ladisai_messages',
    description: 'Read messages from the frontend-ladisai channel for the previous workday',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of messages to retrieve (default 50)',
          default: 50,
        },
        include_user_info: {
          type: 'boolean',
          description: 'Include user information for each message (default true)',
          default: true,
        },
        manual_date: {
          type: 'string',
          description: 'Manual date override in YYYY-MM-DD format (optional)',
        },
      },
    },
    handler: async (args) => {
      const { limit = 50, include_user_info = true, manual_date } = args;
      
      // Hard-coded channel ID for frontend-ladisai
      const FRONTEND_LADISAI_CHANNEL_ID = 'CPQ1Y03HC';
      
      let oldest: string, latest: string, targetDateName: string;
      
      if (manual_date) {
        // Manual date override
        const targetDate = new Date(manual_date);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        oldest = (startOfDay.getTime() / 1000).toString();
        latest = (endOfDay.getTime() / 1000).toString();
        targetDateName = targetDate.toLocaleDateString();
      } else {
        // Auto-calculate previous workday
        const timeRange = getPreviousWorkday();
        oldest = timeRange.oldest;
        latest = timeRange.latest;
        
        const today = new Date().getDay();
        const daysBack = today === 1 ? 3 : (today === 0 ? 2 : (today === 6 ? 1 : 1));
        targetDateName = getWorkdayName(daysBack);
      }
      
      try {
        const response = await slackClient.getChannelHistory({
          channel: FRONTEND_LADISAI_CHANNEL_ID,
          limit,
          oldest,
          latest,
        });

        if (!response.ok) {
          throw new Error(`Failed to get frontend-ladisai messages: ${response.error}`);
        }

        const messages = response.messages?.map(message => {
          const baseMessage = {
            ts: message.ts,
            user: message.user,
            text: message.text,
            type: message.type,
            subtype: message.subtype,
            thread_ts: message.thread_ts,
            reply_count: message.reply_count,
            // Convert timestamp to readable date
            readable_time: message.ts ? new Date(parseFloat(message.ts) * 1000).toLocaleString() : 'Unknown time',
            // No reactions included as per user request
          };

          return baseMessage;
        }) || [];

        // Get user info if requested
        let enrichedMessages = messages;
        if (include_user_info && messages.length > 0) {
          const userCache = new Map();
          
          for (const message of messages) {
            if (message.user && !userCache.has(message.user)) {
              try {
                const userInfo = await slackClient.getUserInfo(message.user);
                if (userInfo.ok) {
                  userCache.set(message.user, {
                    real_name: userInfo.user?.real_name,
                    display_name: userInfo.user?.profile?.display_name,
                    name: userInfo.user?.name,
                  });
                }
              } catch (error) {
                // If we can't get user info, continue without it
                console.error(`Failed to get user info for ${message.user}:`, error);
              }
            }
          }

          enrichedMessages = messages.map(message => ({
            ...message,
            user_info: message.user ? userCache.get(message.user) : null,
          }));
        }

        return {
          success: true,
          channel: 'frontend-ladisai',
          channel_id: FRONTEND_LADISAI_CHANNEL_ID,
          target_date: targetDateName,
          time_range: {
            oldest: new Date(parseFloat(oldest) * 1000).toLocaleString(),
            latest: new Date(parseFloat(latest) * 1000).toLocaleString(),
          },
          messages: enrichedMessages,
          total: enrichedMessages.length,
          message: `Successfully retrieved ${enrichedMessages.length} messages from frontend-ladisai for ${targetDateName}`,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          channel: 'frontend-ladisai',
          channel_id: FRONTEND_LADISAI_CHANNEL_ID,
          target_date: targetDateName,
        };
      }
    },
  };
} 