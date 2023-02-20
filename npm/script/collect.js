"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_js_1 = require("./consts.js");
async function collect(doc, fetcher) {
    const parts = new Map();
    const getParts = (lines) => lines
        .filter((line) => line[0] === consts_js_1.LineType.Part)
        .map((line) => line[14])
        .filter((part) => !parts.has(part));
    const collect = async (name, lines) => {
        parts.set(name, lines);
        for (const part of getParts(lines)) {
            await collect(part, await fetcher(part));
        }
    };
    await collect(consts_js_1.ROOT_MODEL, doc);
    return parts;
}
exports.default = collect;
