import { Client, GatewayIntentBits, Collection } from "discord.js";
import type { BotCommand } from "./types";

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildModeration,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
    ]
  }) as Client & {
    commands: Collection<string, BotCommand>;
  };

  client.on('debug', console.log);
  client.on('warn', console.warn);
  client.on('error', console.error);

  client.commands = new Collection();

  export default client;