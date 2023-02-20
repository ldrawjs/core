"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_js_1 = require("./consts.js");
const three_js_1 = require("./three.js");
// todo handle colors, materials, steps, ...
async function generate(docs) {
    const root = docs.get(consts_js_1.ROOT_MODEL);
    const cache = new Map();
    const build = (name, [_, faces, lines, optLines, parts]) => {
        const group = new three_js_1.Group();
        for (const [_, c, partName, matrix] of parts) {
            const part = cache.has(partName)
                ? cache.get(partName)
                : build(partName, docs.get(partName));
            const g = part.clone();
            g.applyMatrix4(matrix);
            group.add(g);
        }
        for (const [_, c, vecs] of lines) {
            const material = new three_js_1.LineBasicMaterial({ color: 0xff0000 });
            const geometry = new three_js_1.BufferGeometry().setFromPoints(vecs);
            const line = new three_js_1.Line(geometry, material);
            group.add(line);
        }
        for (const [_, c, vecs, controls] of optLines) {
            const material = new three_js_1.LineBasicMaterial({ color: 0xffff00 });
            const geometry = new three_js_1.BufferGeometry().setFromPoints(vecs);
            const line = new three_js_1.Line(geometry, material);
            group.add(line);
        }
        for (const [_, c, vecs] of faces) {
            const material = new three_js_1.MeshBasicMaterial({ color: 0x0000ff });
            const geometry = new three_js_1.BufferGeometry().setFromPoints(vecs);
            group.add(new three_js_1.Mesh(geometry, material));
        }
        cache.set(name, group);
        return group;
    };
    return build(consts_js_1.ROOT_MODEL, root);
}
exports.default = generate;
