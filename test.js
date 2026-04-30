import { findCard, findRelic, findAncient, findPotion } from './src/api.js';
import { cardEmbed, relicEmbed, ancientEmbed, potionEmbed } from './src/embeds.js';

async function test_card_blade_dance() {
    const card = await findCard('Blade Dance');
    const embed = cardEmbed(card);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

async function test_card_stardust() {
    const card = await findCard('Stardust');
    const embed = cardEmbed(card);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

async function test_card_curse_of_the_bell() {
    const card = await findCard('Curse of the Bell');
    const embed = cardEmbed(card);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

async function test_ancient_vakuu() {
    const ancient = await findAncient('Vakuu');
    const embed = ancientEmbed(ancient);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

async function test_potion_flex_potion() {
    const potion = await findPotion('Flex Potion');
    const embed = potionEmbed(potion);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

async function test_relic_unceasing_top() {
    const relic = await findRelic('Unceasing Top');
    const embed = relicEmbed(relic);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

// Change which test runs here
test_relic_unceasing_top();