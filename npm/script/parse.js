"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parse(ldrawString) {
    return ldrawString.split("\n")
        .map((line) => line.trim())
        .filter((line) => "" !== line)
        .map((line) => line.split(/\s+/))
        .map(([type, ...parts]) => {
        const t = parseFloat(type);
        if (0 === t) {
            return [t, ...parts];
        }
        if (1 === t) {
            const part = parts.pop();
            return [t, ...parts.map((t) => parseFloat(t)), part];
        }
        return [t, ...parts.map((t) => parseFloat(t))];
    });
}
exports.default = parse;
