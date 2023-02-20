import { ROOT_MODEL } from "./consts.js";
import { BufferGeometry, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, } from "./three.js";
// todo handle colors, materials, steps, ...
export default async function generate(docs) {
    const root = docs.get(ROOT_MODEL);
    const cache = new Map();
    const build = (name, [_, faces, lines, optLines, parts]) => {
        const group = new Group();
        for (const [_, c, partName, matrix] of parts) {
            const part = cache.has(partName)
                ? cache.get(partName)
                : build(partName, docs.get(partName));
            const g = part.clone();
            g.applyMatrix4(matrix);
            group.add(g);
        }
        for (const [_, c, vecs] of lines) {
            const material = new LineBasicMaterial({ color: 0xff0000 });
            const geometry = new BufferGeometry().setFromPoints(vecs);
            const line = new Line(geometry, material);
            group.add(line);
        }
        for (const [_, c, vecs, controls] of optLines) {
            const material = new LineBasicMaterial({ color: 0xffff00 });
            const geometry = new BufferGeometry().setFromPoints(vecs);
            const line = new Line(geometry, material);
            group.add(line);
        }
        for (const [_, c, vecs] of faces) {
            const material = new MeshBasicMaterial({ color: 0x0000ff });
            const geometry = new BufferGeometry().setFromPoints(vecs);
            group.add(new Mesh(geometry, material));
        }
        cache.set(name, group);
        return group;
    };
    return build(ROOT_MODEL, root);
}
