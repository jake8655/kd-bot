import { envsafe, num, str } from 'envsafe';

export const env = envsafe({
  JSON_FILE_PATH: str({
    devDefault: './data.json',
  }),
  NODE_ENV: str({
    devDefault: 'development',
    choices: ['development', 'test', 'production'],
  }),
  DISCORD_TOKEN: str(),
  CHANNEL_ID: str(),
  INTERVAL: num({
    devDefault: 1000 * 30,
  }),
});
