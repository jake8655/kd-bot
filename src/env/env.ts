import { envsafe, str } from "envsafe";

export const env = envsafe({
  NODE_ENV: str({
    devDefault: "development",
    choices: ["development", "test", "production"],
  }),
  DATABASE_HOST: str({
    devDefault: "localhost",
  }),
  DATABASE_USER: str({
    devDefault: "root",
  }),
  DATABASE_PASSWORD: str({
    devDefault: "",
  }),
  DATABASE_NAME: str({
    devDefault: "fivem",
  }),
  DISCORD_TOKEN: str(),
});
