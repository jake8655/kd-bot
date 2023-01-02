import { envsafe, num, str } from 'envsafe';

export const env = envsafe({
  NODE_ENV: str({
    devDefault: 'development',
    choices: ['development', 'test', 'production'],
  }),
  DATABASE_HOST: str({
    devDefault: 'localhost',
  }),
  DATABASE_USER: str({
    devDefault: 'root',
  }),
  DATABASE_PASSWORD: str({
    allowEmpty: true,
    devDefault: 'password',
  }),
  DATABASE_NAME: str({
    devDefault: 'test',
  }),
  DISCORD_TOKEN: str(),
  CHANNEL_ID: str(),
  INTERVAL: num({
    devDefault: 1000 * 30,
  }),
});
