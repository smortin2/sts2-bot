import { findCard, findRelic, findAncient, findPotion } from './src/api.js';
import { cardEmbed, relicEmbed, ancientEmbed, potionEmbed } from './src/embeds.js';

async function test_card(name) {
    const card = await findCard(name);
    const embed = cardEmbed(card);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

async function test_ancient(name) {
    const ancient = await findAncient(name);
    const embed = ancientEmbed(ancient);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

async function test_potion(name) {
    const potion = await findPotion(name);
    const embed = potionEmbed(potion);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

async function test_relic(name) {
    const relic = await findRelic(name);
    const embed = relicEmbed(relic);
    const response = { type: 4, data: { embeds: [embed] } };
    console.log(JSON.stringify(response, null, 2));
}

// test_card('curse of the bell')
// test_ancient('vakuu')
// test_potion('foul potion')
// test_relic('snecko eye')