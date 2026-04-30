export const pickFirst = (...vals) => vals.find(v => v != null && v !== "") ?? null;

export const arrayify = val => (val == null ? [] : Array.isArray(val) ? val : [val]);

// Isolated here so platform rendering doesn't corrupt the regex when api.js is updated
export function formatText(text) {
    if (!text) return "";
    return text
        .replace(/\[[^\]]*\]/g, "")
        .replace(/\s*[\r\n]+\s*/g, " ")
        .trim();
}

export function extractString(val) {
    if (val == null) return null;
    if (typeof val === "object") return pickFirst(val.name, val.title, val.display_name, val.id);
    return String(val);
}

export function bestMatch(items, query) {
    if (!items?.length) return null;
    const q = String(query || "").trim().toLowerCase();

    let best = null, bestScore = -1;

    for (const item of items) {
        const names = [item.name, item.title, item.display_name, item.event_name, item.label, item.slug, item.id, item.epithet]
            .filter(Boolean)
            .map(n => String(n).trim().toLowerCase());

        for (const n of names) {
            let score = -1;
            if (n === q) score = 100;
            else if (n.startsWith(q)) score = 80;
            else if (n.includes(q)) score = 60;
            else if (n.split(/[^a-z0-9]+/).includes(q)) score = 50;

            if (score > bestScore) {
                bestScore = score;
                best = item;
            }
        }
    }
    return best;
}