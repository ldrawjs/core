import type { LDrawDoc, LDrawDocuments, PART } from "./types.ts";
import { ROOT_MODEL } from "./consts.ts";
import three from "./utils/three.ts";

// todo handle colors, materials, steps, ...

export default async function generate(docs: LDrawDocuments) {
  const {
    BufferGeometry,
    Group,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshBasicMaterial,
  } = await three();

  const root = docs.get(ROOT_MODEL) as LDrawDoc;
  const cache = new Map<string, unknown>();

  const build = (
    name: PART,
    [_, faces, lines, optLines, parts]: LDrawDoc,
  ): any /*Group*/ => {
    const group = new Group();

    for (const [_, c, partName, matrix] of parts) {
      const part = cache.has(partName)
        ? (cache.get(partName) as typeof Group)
        : build(partName, docs.get(partName) as LDrawDoc);
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
