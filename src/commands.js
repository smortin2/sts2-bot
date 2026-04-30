const makeCmd = (name, desc) => ({
    name,
    description: `Look up a Slay the Spire 2 ${desc} by name`,
    options: [{ type: 3, name: "name", description: `The ${name} name to search for`, required: true }],
});

export const CARD_COMMAND = makeCmd("card", "card");
export const RELIC_COMMAND = makeCmd("relic", "relic");
export const ANCIENT_COMMAND = makeCmd("ancient", "Ancient");
export const POTION_COMMAND = makeCmd("potion", "potion");

export const ALL_COMMANDS = [CARD_COMMAND, RELIC_COMMAND, ANCIENT_COMMAND, POTION_COMMAND];