import type { IncomingMessage, ServerResponse } from 'node:http';
export function createPollApi(options: {
  authenticate: (request: IncomingMessage) => Promise<{ sub: string } | undefined>;
  discordToken: string;
  guildId?: string;
  env?: Record<string, string | undefined>;
}): ((request: IncomingMessage, response: ServerResponse) => Promise<boolean>) & { close?: () => void };
