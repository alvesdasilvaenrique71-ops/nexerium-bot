const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once("ready", () => { console.log("Bot online!"); });
client.login("SEU_TOKEN_AQUI");
