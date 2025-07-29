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
  // 解析命令行參數
  const args = process.argv.slice(2);
  let slackToken = process.env.SLACK_BOT_TOKEN;

  // 檢查命令行參數中的 token
  const tokenIndex = args.indexOf('--token');
  if (tokenIndex !== -1 && tokenIndex + 1 < args.length) {
    slackToken = args[tokenIndex + 1];
  }
  
  if (!slackToken) {
    console.error('Error: Slack Bot Token is required');
    console.error('Usage:');
    console.error('  node dist/index.js --token xoxb-your-token-here');
    console.error('  or set SLACK_BOT_TOKEN environment variable');
    process.exit(1);
  }

  // Create MCP server
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

  // Initialize Slack client
  const slackClient = new SlackClient(slackToken);
  
  // Create tools
  const tools = createSlackTools(slackClient);

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((tool): Tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    const tool = tools.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
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
      throw new Error(`Tool execution failed: ${errorMessage}`);
    }
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Slack MCP server started');
}

// Error handling
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

main().catch((error) => {
  console.error('Failed to start:', error);
  process.exit(1);
}); 