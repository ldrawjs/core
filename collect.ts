import { AnyLine, Collected, Fetcher, LDrawJson, PartLine } from "./types.ts";
import { LineType, ROOT_MODEL } from "./consts.ts";

export default async function collect(
  doc: LDrawJson,
  fetcher: Fetcher,
): Promise<Collected> {
  const parts = new Map<string, AnyLine[]>();

  const getParts = (lines: AnyLine[]) =>
    lines
      .filter((line: AnyLine) => line[0] === LineType.Part)
      .map((line: AnyLine) => (line as PartLine)[14])
      .filter((part) => !parts.has(part));

  const collect = async (name: string, lines: AnyLine[]) => {
    parts.set(name, lines);
    for (const part of getParts(lines)) {
      await collect(part, await fetcher(part));
    }
  };
  await collect(ROOT_MODEL, doc);
  return parts;
}
