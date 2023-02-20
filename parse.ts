import type { LDrawJson, MetaLine, PartLine, ShapeLine } from "./types.ts";

export default function parse(ldrawString: string): LDrawJson {
  return ldrawString.split("\n")
    .map((line) => line.trim())
    .filter((line) => "" !== line)
    .map((line) => line.split(/\s+/))
    .map(([type, ...parts]) => {
      const t = parseFloat(type);
      if (0 === t) {
        return [t, ...parts] as MetaLine;
      }
      if (1 === t) {
        const part = parts.pop() as string;
        return [t, ...parts.map((t) => parseFloat(t)), part] as PartLine;
      }
      return [t, ...parts.map((t) => parseFloat(t))] as ShapeLine;
    });
}
