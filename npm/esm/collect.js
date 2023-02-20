import { LineType, ROOT_MODEL } from "./consts.js";
export default async function collect(doc, fetcher) {
    const parts = new Map();
    const getParts = (lines) => lines
        .filter((line) => line[0] === LineType.Part)
        .map((line) => line[14])
        .filter((part) => !parts.has(part));
    const collect = async (name, lines) => {
        parts.set(name, lines);
        for (const part of getParts(lines)) {
            await collect(part, await fetcher(part));
        }
    };
    await collect(ROOT_MODEL, doc);
    return parts;
}
