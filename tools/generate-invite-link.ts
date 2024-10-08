import { env } from "bun";

console.log(
  `https://discord.com/oauth2/authorize?client_id=${env.CLIENT_ID}&permissions=8&integration_type=0&scope=bot+applications.commands`
);
