import { Client, GatewayIntentBits } from "discord.js";
import { connect, createQuery } from "./database";
import { env } from "./env/env";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.on("ready", async () => {
  console.log("Ready!✅");

  const con = connect();
  const query = createQuery(con);

  const res = await query("SELECT * FROM test");
  console.log(res);
});

client.login(env.DISCORD_TOKEN);
