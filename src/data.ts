import { z } from 'zod';
import fs from 'fs/promises';
import { env } from './env/env';
import path from 'path';

const fileSchema = z.tuple([
  z.array(
    z.object({
      identifier: z.string(),
      name: z.string(),
      deaths: z.number(),
      headshots: z.number(),
      kills: z.number(),
    }),
  ),
  z.unknown(),
]);

const botSchema = z.object({
  id: z.string().nullish(),
});

export const readFile = async () => {
  const file = await fs.readFile(env.JSON_FILE_PATH, 'utf-8');
  try {
    const data = fileSchema.parse(JSON.parse(file));
    return data;
  } catch (e) {
    console.error('❌ Error reading file kd.json', e);
    throw new Error('Error parsing file kd.json');
  }
};

export const getLeaderboard = async () => {
  const file = await readFile();

  const data = file[0].sort((a, b) => b.kills / b.deaths - a.kills / a.deaths);

  const dataWithKd = data.map(player => ({
    ...player,
    ratio: player.kills / player.deaths,
  }));
  dataWithKd.slice(0, env.TOP);

  return dataWithKd;
};

export const getMessageId = async () => {
  const file = await fs.readFile(path.resolve('./bot.json'), 'utf-8');
  try {
    const data = botSchema.parse(JSON.parse(file));
    return data.id;
  } catch (e) {
    console.error('❌ Error reading file bot.json', e);
    throw new Error('Error parsing file bot.json');
  }
};

export const setMessageId = async (id: string) => {
  const file = await fs.readFile(path.resolve('./bot.json'), 'utf-8');
  try {
    const data = botSchema.parse(JSON.parse(file));
    const newData = { ...data, id };
    await fs.writeFile('./bot.json', JSON.stringify(newData));
  } catch (e) {
    console.error('❌ Error writing to file bot.json', e);
    throw new Error('Error parsing file bot.json');
  }
};
