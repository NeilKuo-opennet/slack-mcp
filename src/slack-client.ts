import { WebClient } from '@slack/web-api';
import type {
  ChatPostMessageResponse,
  ConversationsListResponse,
  UsersListResponse,
  ConversationsHistoryResponse,
  ConversationsCreateResponse,
  ConversationsInviteResponse,
} from '@slack/web-api';

export class SlackClient {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  /**
   * 發送訊息到頻道或用戶
   */
  async sendMessage(options: {
    channel: string;
    text: string;
    blocks?: any[];
    thread_ts?: string;
  }): Promise<ChatPostMessageResponse> {
    return await this.client.chat.postMessage(options);
  }

  /**
   * 獲取頻道列表
   */
  async getChannels(options: {
    exclude_archived?: boolean;
    limit?: number;
    types?: string;
  } = {}): Promise<ConversationsListResponse> {
    return await this.client.conversations.list({
      exclude_archived: true,
      limit: 100,
      types: 'public_channel,private_channel',
      ...options,
    });
  }

  /**
   * 獲取用戶列表
   */
  async getUsers(options: {
    limit?: number;
  } = {}): Promise<UsersListResponse> {
    return await this.client.users.list({
      limit: 100,
      ...options,
    });
  }

  /**
   * 獲取頻道歷史訊息
   */
  async getChannelHistory(options: {
    channel: string;
    limit?: number;
    oldest?: string;
    latest?: string;
  }): Promise<ConversationsHistoryResponse> {
    return await this.client.conversations.history({
      limit: 50,
      ...options,
    });
  }

  /**
   * 創建新頻道
   */
  async createChannel(options: {
    name: string;
    is_private?: boolean;
  }): Promise<ConversationsCreateResponse> {
    return await this.client.conversations.create(options);
  }

  /**
   * 邀請用戶到頻道
   */
  async inviteToChannel(options: {
    channel: string;
    users: string;
  }): Promise<ConversationsInviteResponse> {
    return await this.client.conversations.invite(options);
  }

  /**
   * 獲取用戶資訊
   */
  async getUserInfo(userId: string) {
    return await this.client.users.info({ user: userId });
  }

  /**
   * 搜尋訊息
   */
  async searchMessages(query: string, options: {
    count?: number;
    page?: number;
  } = {}) {
    return await this.client.search.messages({
      query,
      count: 20,
      page: 1,
      ...options,
    });
  }
} 