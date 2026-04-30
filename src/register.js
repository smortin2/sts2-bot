import { ALL_COMMANDS } from "./commands.js";

const APP_ID = process.env.DISCORD_APPLICATION_ID;
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!APP_ID || !TOKEN) {
    console.error("Missing DISCORD_APPLICATION_ID or DISCORD_TOKEN env vars.");
    process.exit(1);
}

const url = `https://discord.com/api/v10/applications/${APP_ID}${GUILD_ID ? `/guilds/${GUILD_ID}` : ""}/commands`;

const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bot ${TOKEN}` },
    body: JSON.stringify(ALL_COMMANDS),
});

if (!response.ok) {
    console.error(`Failed to register commands: ${response.status}`, await response.text());
    process.exit(1);
}

const data = await response.json();
console.log(`✅ Registered ${data.length} command(s):\n${data.map(cmd => `   /${cmd.name}`).join("\n")}`);