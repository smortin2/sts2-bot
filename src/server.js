import { verifyKey, InteractionType, InteractionResponseType } from "discord-interactions";
import * as api from "./api.js";
import * as embeds from "./embeds.js";

const HANDLERS = {
    card: { fetch: api.findCard, embed: embeds.cardEmbed, label: "card" },
    relic: { fetch: api.findRelic, embed: embeds.relicEmbed, label: "relic" },
    ancient: { fetch: api.findAncient, embed: embeds.ancientEmbed, label: "Ancient" },
    potion: { fetch: api.findPotion, embed: embeds.potionEmbed, label: "potion" },
};

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
});

export default {
    async fetch(request, env) {
        if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

        const signature = request.headers.get("X-Signature-Ed25519");
        const timestamp = request.headers.get("X-Signature-Timestamp");
        const rawBody = await request.text();

        if (!await verifyKey(rawBody, signature, timestamp, env.DISCORD_PUBLIC_KEY)) {
            return new Response("Invalid request signature", { status: 401 });
        }

        const interaction = JSON.parse(rawBody);

        if (interaction.type === InteractionType.PING) {
            return jsonResponse({ type: InteractionResponseType.PONG });
        }

        if (interaction.type === InteractionType.APPLICATION_COMMAND) {
            const { name, options } = interaction.data || {};
            const handler = HANDLERS[name];

            if (!handler) {
                return jsonResponse({ type: 4, data: { content: `Unknown command: \`/${name}\`` } });
            }

            const query = options?.find(o => o.name === "name")?.value;
            if (!query) {
                return jsonResponse({ type: 4, data: { content: `Please provide a ${handler.label} name.` } });
            }

            const result = await handler.fetch(query);
            if (!result) {
                return jsonResponse({ type: 4, data: { content: `❌ No ${handler.label} found matching **${query}**.` } });
            }

            return jsonResponse({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { embeds: [handler.embed(result)] },
            });
        }

        return jsonResponse({ error: "Unhandled interaction type" }, 400);
    },
};