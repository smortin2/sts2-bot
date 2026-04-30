import { findCard, findRelic, findAncient, findPotion } from './src/api.js';
import { cardEmbed, relicEmbed, ancientEmbed, potionEmbed } from './src/embeds.js';

let passed = 0;
let failed = 0;

function assert(condition, message, payload = null) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        if (payload) console.error(`   -> Info:`, payload);
        failed++;
    }
}

async function test_cards() {
    console.log("\n--- Testing Cards ---");

    const bdCard = await findCard('Blade Dance');
    const bdEmbed = cardEmbed(bdCard);
    assert(bdEmbed.title.includes('(C)'), 'Blade Dance is rarity common (C)', bdEmbed.title);
    assert(!bdCard.description.includes('['), 'Blade Dance has no brackets in the description', bdCard.description);
    const bdFields = bdEmbed.fields.map(f => f.name.toLowerCase());
    assert(['cost', 'type', 'character'].every(f => bdFields.includes(f)), 'Blade Dance has fields cost, type, character', bdFields);

    const sdCard = await findCard('Stardust');
    const sdEmbed = cardEmbed(sdCard);
    const starField = sdEmbed.fields.find(f => f.name.toLowerCase() === 'stars');
    assert(starField?.value === 'X', 'Stardust has field "stars" with value X', starField);

    const bellCard = await findCard('Curse of the Bell');
    const bellEmbed = cardEmbed(bellCard);
    assert(bellEmbed.title.includes('(X)'), 'Curse of the Bell is rarity curse (X)', bellEmbed.title);
    assert(bellCard.description === 'Unplayable. Eternal.', 'Curse of the Bell renders keywords correctly in description', bellCard.description);
}

async function test_potions() {
    console.log("\n--- Testing Potions ---");

    const foulPotion = await findPotion('Foul');
    const foulEmbed = potionEmbed(foulPotion);
    assert(foulEmbed.title.includes('(S)'), 'Foul potion suffix is (S)', foulEmbed.title);
}

async function test_relics() {
    console.log("\n--- Testing Relics ---");

    const fiddleRelic = await findRelic('Fiddle');
    const fiddleEmbed = relicEmbed(fiddleRelic);
    assert(fiddleEmbed.title.includes('(A)'), 'Fiddle suffix is (A)', fiddleEmbed.title);

    const topRelic = await findRelic('Unceasing Top');
    const topEmbed = relicEmbed(topRelic);
    assert(topEmbed.title.includes('(R)'), 'Unceasing Top is (R)', topEmbed.title);
    assert(topEmbed.title && topEmbed.description && topEmbed.color !== undefined && topEmbed.footer && topEmbed.thumbnail, 'Unceasing Top has expected base properties', topEmbed);
    assert(!topEmbed.fields || !topEmbed.fields.some(f => f.name === 'Pool'), 'Unceasing Top does not have pool field', topEmbed.fields);

    const bloodRelic = await findRelic('Burning Blood');
    const bloodEmbed = relicEmbed(bloodRelic);
    assert(bloodEmbed.title.includes('(S)'), 'Burning Blood is (S)', bloodEmbed.title);
    assert(bloodEmbed.title && bloodEmbed.description && bloodEmbed.color !== undefined && bloodEmbed.footer && bloodEmbed.thumbnail, 'Burning Blood has expected base properties', bloodEmbed);
    assert(bloodEmbed.fields.some(f => f.name === 'Pool'), 'Burning Blood has Pool field', bloodEmbed.fields);

    const scrollRelic = await findRelic('Arcane Scroll');
    const scrollEmbed = relicEmbed(scrollRelic);
    assert(scrollEmbed.fields.some(f => f.name === 'Ancient'), 'Arcane Scroll has Ancient field', scrollEmbed.fields);
}

async function test_ancients() {
    console.log("\n--- Testing Ancients ---");

    const vakuu = await findAncient('Vakuu');
    const vakuuEmbed = ancientEmbed(vakuu);

    assert(vakuuEmbed.title.includes('Vakuu, The First Demon'), 'Vakuu title includes epithet', vakuuEmbed.title);
    assert(!vakuuEmbed.fields.some(f => f.name.toLowerCase() === 'epithet'), 'Vakuu does not have an standalone epithet field', vakuuEmbed.fields);
    assert(vakuuEmbed.color && vakuuEmbed.footer && vakuuEmbed.thumbnail, 'Vakuu has color, footer, thumbnail');
    assert(vakuuEmbed.fields.some(f => f.name === 'Relic Offerings'), 'Vakuu has relic offerings field', vakuuEmbed.fields);
    assert(vakuu.relics.includes('Fiddle'), "Vakuu contains exactly the string 'Fiddle' (case sensitive)", vakuu.relics);
}

async function runAll() {
    await test_cards();
    await test_potions();
    await test_relics();
    await test_ancients();

    console.log(`\n============================`);
    console.log(`Results: ${passed} Passed | ${failed} Failed`);
    console.log(`============================`);

    if (failed > 0) process.exit(1);
}

runAll();