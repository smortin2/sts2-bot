/**
 * Cloudflare Worker entry point for the STS2 Discord bot.
 *
 * Discord sends HTTP-based interactions to this worker.
 * We verify the signature, parse the interaction, call the
 * Spire Codex API, and return a rich embed response.
 */

import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions";
import { findCard, findRelic, findAncient, findPotion } from "./api.js";
import { cardEmbed, relicEmbed, ancientEmbed, potionEmbed } from "./embeds.js";

// ---------------------------------------------------------------------------
// Interaction handler map:  command name  →  { fetch, embed }
// ---------------------------------------------------------------------------

const HANDLERS = {
    card: { fetch: findCard, embed: cardEmbed, label: "card" },
    relic: { fetch: findRelic, embed: relicEmbed, label: "relic" },
    ancient: { fetch: findAncient, embed: ancientEmbed, label: "Ancient" },
    potion: { fetch: findPotion, embed: potionEmbed, label: "potion" },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

/**
 * Extract the first option value from a slash command interaction.
 */
function getOptionValue(interaction, optionName) {
    const options = interaction.data?.options ?? [];
    const opt = options.find((o) => o.name === optionName);
    return opt?.value ?? null;
}

// ---------------------------------------------------------------------------
// Request handler
// ---------------------------------------------------------------------------

async function handleRequest(request, env) {
    // Only accept POSTs (Discord interactions are always POST).
    if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    // ---- Signature verification ----
    const signature = request.headers.get("X-Signature-Ed25519");
    const timestamp = request.headers.get("X-Signature-Timestamp");
    const rawBody = await request.text();

    const isValid = await verifyKey(rawBody, signature, timestamp, env.DISCORD_PUBLIC_KEY);
    if (!isValid) {
        return new Response("Invalid request signature", { status: 401 });
    }

    const interaction = JSON.parse(rawBody);

    // ---- Ping (Discord verification handshake) ----
    if (interaction.type === InteractionType.PING) {
        return jsonResponse({ type: InteractionResponseType.PONG });
    }

    // ---- Application Command (slash command) ----
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        const commandName = interaction.data?.name;
        const handler = HANDLERS[commandName];

        if (!handler) {
            return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `Unknown command: \`/${commandName}\`` },
            });
        }

        const query = getOptionValue(interaction, "name");
        if (!query) {
            return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: `Please provide a ${handler.label} name.` },
            });
        }

        // Call the Spire Codex API
        const result = await handler.fetch(query);

        if (!result) {
            return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `❌ No ${handler.label} found matching **${query}**. Try a different name or check spelling.`,
                },
            });
        }

        const embed = handler.embed(result);

        return jsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                embeds: [embed],
            },
        });
    }

    // ---- Fallback ----
    return jsonResponse({ error: "Unhandled interaction type" }, 400);
}

// ---------------------------------------------------------------------------
// Worker export
// ---------------------------------------------------------------------------

export default {
    async fetch(request, env) {
        return handleRequest(request, env);
    },
};