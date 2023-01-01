import { Client, GatewayIntentBits } from 'discord.js';
import { env } from './env/env';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on('ready', async () => {
  console.log('Ready!✅');

  const interval = setInterval(async () => {}, 1000 * 60 * 2);
});

client.login(env.DISCORD_TOKEN);
