/**
 * Registers slash commands with the Discord API.
 * Run once: `npm run register`
 *
 * Requires environment variables:
 *   DISCORD_APPLICATION_ID
 *   DISCORD_TOKEN
 *
 * You can optionally set DISCORD_GUILD_ID to register guild-scoped
 * commands (instant) instead of global commands (up to 1hr propagation).
 */

import { ALL_COMMANDS } from "./commands.js";

const DISCORD_API = "https://discord.com/api/v10";

const APP_ID = process.env.DISCORD_APPLICATION_ID;
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

if (!APP_ID || !TOKEN) {
    console.error("Missing DISCORD_APPLICATION_ID or DISCORD_TOKEN env vars.");
    console.error("Export them or put them in .dev.vars / your shell env.");
    process.exit(1);
}

// Guild-scoped commands update instantly; global commands can take up to an hour.
const url = GUILD_ID
    ? `${DISCORD_API}/applications/${APP_ID}/guilds/${GUILD_ID}/commands`
    : `${DISCORD_API}/applications/${APP_ID}/commands`;

const response = await fetch(url, {
    method: "PUT",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${TOKEN}`,
    },
    body: JSON.stringify(ALL_COMMANDS),
});

if (!response.ok) {
    const text = await response.text();
    console.error(`Failed to register commands: ${response.status}`);
    console.error(text);
    process.exit(1);
}

const data = await response.json();
console.log(`✅ Registered ${data.length} command(s):`);
data.forEach((cmd) => console.log(`   /${cmd.name}`));