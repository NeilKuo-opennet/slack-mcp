#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { SlackClient } from './slack-client.js';
import { createSlackTools } from './tools/index.js';

async function main() {
  // 從環境變數獲取 Slack token
  const slackToken = process.env.SLACK_BOT_TOKEN;
  
  if (!slackToken) {
    console.error('錯誤：請設置 SLACK_BOT_TOKEN 環境變數');
    process.exit(1);
  }

  // 創建 MCP 伺服器
  const server = new Server(
    {
      name: 'slack-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 初始化 Slack 客戶端
  const slackClient = new SlackClient(slackToken);
  
  // 創建工具
  const tools = createSlackTools(slackClient);

  // 列出可用工具
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((tool): Tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // 處理工具調用
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    const tool = tools.find(t => t.name === name);
    if (!tool) {
      throw new Error(`未知工具: ${name}`);
    }

    try {
      const result = await tool.handler(args || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`工具執行失敗: ${errorMessage}`);
    }
  });

  // 啟動伺服器
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Slack MCP 伺服器已啟動');
}

// 錯誤處理
process.on('SIGINT', () => {
  console.error('收到 SIGINT，正在關閉...');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  console.error('未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('啟動失敗:', error);
  process.exit(1);
}); 