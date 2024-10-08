import { env } from "bun";

import { Client, Events, GatewayIntentBits } from "discord.js";

let client: Client | undefined;

export const getClient = () => client ?? createClient();

export const createClient = () => {
  if (client) return client;

  const newClient = new Client({ intents: [GatewayIntentBits.Guilds] });

  newClient.once(Events.ClientReady, (readyClient: Client) => {
    console.log(`Ready! Logged in as ${readyClient.user?.tag}`);
  });

  newClient.login(env.TOKEN);

  client = newClient;

  return newClient;
};
