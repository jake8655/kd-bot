import {
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  Message,
} from 'discord.js';
import { z } from 'zod';
import { getLeaderboard, queryDb, safeQuery } from './database';
import { env } from './env/env';

// Cleanup function
const cleanup = (interval: NodeJS.Timer) => {
  clearInterval(interval);
  process.exit();
};
process.stdin.resume(); // so the program will not close instantly

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const roundToTwo = (num: number) => (Math.round(num * 100) / 100).toFixed(2);
const log = (msg: string) =>
  console.log(
    `[${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}] ${msg}`
  );

const sendMessage = async () => {
  const channel = client.channels.cache.get(env.CHANNEL_ID);

  if (!channel || channel.type !== ChannelType.GuildText) {
    console.warn('❌ Invalid CHANNEL_ID');
    throw new Error('Invalid CHANNEL_ID');
  }

  try {
    const [id] = await safeQuery(
      'select id from message',
      z.object({
        id: z.string(),
      })
    );

    const leaderboard = await getLeaderboard();

    const maxNameLength = leaderboard.reduce(
      // Add str(idx+1).length+2 to account for the number in the leaderboard
      (acc, { name }, idx) =>
        Math.max(acc, name.length + ('' + (idx + 1)).length + 2),
      0
    );

    const maxRatioLength = leaderboard.reduce(
      (acc, { ratio }) => Math.max(acc, ('' + ratio.toFixed(2)).length),
      0
    );

    const leaderBoardField = leaderboard
      .map(({ name, ratio }, idx) => {
        // Add str(idx+1).length+2 to account for the number in the leaderboard
        if (name.length + ('' + (idx + 1)).length + 2 < maxNameLength) {
          name += ' '.repeat(
            maxNameLength - name.length - 2 - ('' + (idx + 1)).length
          );
        }

        let ratioStr = '' + ratio.toFixed(2);
        if (('' + ratio.toFixed(2)).length < maxRatioLength) {
          ratioStr += ' '.repeat(
            maxRatioLength - ('' + ratio.toFixed(2)).length
          );
        }

        return `\`${idx + 1}. ${name} | KD: ${ratioStr}\``;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor('Green')
      .setAuthor({
        name: '😇 K/D Leaderboard',
        iconURL: 'https://i.imgur.com/4ZQZ9Zm.png',
      })
      .setDescription(
        `Itt a legtöbb öléssel rendelkező ${leaderboard.length
        } játékos!\n\n**Összes ölés:** ${leaderboard.reduce(
          (prev, { kills }) => prev + kills,
          0
        )}\n**Összes halál:** ${leaderboard.reduce(
          (prev, { deaths }) => prev + deaths,
          0
        )}\n**Összes ölés/halál:** ${roundToTwo(
          leaderboard.reduce((prev, { kills }) => prev + kills, 0) /
          leaderboard.reduce((prev, { deaths }) => prev + deaths, 0)
        ) || 0
        }\n**${'-'.repeat(80)}**`
      )
      .addFields(
        {
          name: `Top ${leaderboard.length} játékos:`,
          value: leaderBoardField,
          inline: true,
        },
        {
          name: 'Ölések',
          value: leaderboard.map(({ kills }) => kills).join('\n'),
          inline: true,
        },
        {
          name: 'Halálok',
          value: leaderboard.map(({ deaths }) => deaths).join('\n'),
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({
        iconURL: 'https://i.imgur.com/4ZQZ9Zm.png',
        text: 'K/D Leaderboard',
      });

    if (!id) {
      const msg = await channel.send({ embeds: [embed] });
      log(`📝 Message sent: ${msg.id}`);
      return await queryDb(`insert into message (id) values ('${msg.id}')`);
    }

    let msg: Message<true> | null = null;
    try {
      msg = await channel.messages.fetch(id.id);
      await msg.edit({ embeds: [embed] });
      log(`✏️ Message edited: ${msg.id}`);
    } catch {
      msg = await channel.send({ embeds: [embed] });
      log(`📝 Message sent: ${msg.id}`);
    } finally {
      await queryDb(`update message set id = '${msg?.id || id.id}'`);
    }
  } catch {
    console.warn('❌ Invalid message in database');
    throw new Error('Invalid message in database');
  }
};

client.on('ready', async () => {
  log('✅ Ready!');

  await sendMessage();
  const interval = setInterval(async () => {
    await sendMessage();
  }, env.INTERVAL);

  process.on('SIGINT', () => cleanup(interval));
  process.on('exit', () => cleanup(interval));
});

client.login(env.DISCORD_TOKEN);
