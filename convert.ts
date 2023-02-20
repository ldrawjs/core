import type {
  AllLine,
  Collected,
  LDrawDoc,
  LDrawDocuments,
  LDrawFaced,
  LDrawJson,
  LDrawLineLine,
  LDrawOptLine,
  LDrawPartLine,
  LineLine,
  MetaLine,
  OptLine,
  PartLine,
  QuadLine,
  TriLine,
} from "./types.ts";
import type { VEC } from "./three.ts";
import { LineType, ROOT_MODEL } from "./consts.ts";
import { Matrix4, Vector3 } from "./three.ts";

class ParserContext {
  bfcCertified = false;
  bfcCCW = true;
  bfcInverted = false;
  bfcCull = true;
  startingBuildingStep = false;

  get doubleSided(): boolean {
    return !this.bfcCertified || !this.bfcCull;
  }
}

export default async function convert(doc: Collected): Promise<LDrawDocuments> {
  const root = doc.get(ROOT_MODEL) as LDrawJson;
  const cache = new Map<string, LDrawDoc>();
  const ctx = new ParserContext();

  const vectorized = (...points: number[]) => {
    const vec: VEC[] = [];
    while (points.length) {
      const [x, y, z] = points.splice(0, 3);
      vec.push(new Vector3(x, y, z));
    }
    return vec;
  };

  const build = (name: string, items: LDrawJson): LDrawDoc => {
    let type = "";
    const parts: LDrawPartLine[] = [];
    const faces: LDrawFaced[] = [];
    const lines: LDrawLineLine[] = [];
    const optLines: LDrawOptLine[] = [];

    const converters = {
      [LineType.Meta]: ([_, meta, ...values]: MetaLine) => {
        switch (meta) {
          case "!LDRAW_ORG":
            type = values[0];
            break;
          case "!COLOUR":
            // todo complete
            break;
          case "FILE":
            // todo complete
            break;
          case "BFC":
            // todo simplify
            // update back-face-culling
            for (const token of values) {
              switch (token) {
                case "CERTIFY":
                case "NOCERTIFY":
                  ctx.bfcCertified = token === "CERTIFY";
                  ctx.bfcCCW = true;
                  break;
                case "CW":
                case "CCW":
                  ctx.bfcCCW = token === "CCW";
                  break;
                case "INVERTNEXT":
                  ctx.bfcInverted = true;
                  break;
                case "CLIP":
                case "NOCLIP":
                  ctx.bfcCull = token === "CLIP";
                  break;
              }
            }
            break;
          case "STEP":
            ctx.startingBuildingStep = true;
            break;
        }
      },

      [LineType.Part]: (
        [
          type,
          color,
          posX,
          posY,
          posZ,
          m0,
          m1,
          m2,
          m3,
          m4,
          m5,
          m6,
          m7,
          m8,
          subName,
        ]: PartLine,
      ) => {
        const matrix = new Matrix4().set(
          m0,
          m1,
          m2,
          posX,
          m3,
          m4,
          m5,
          posY,
          m6,
          m7,
          m8,
          posZ,
          0,
          0,
          0,
          1,
        );
        const state = [ctx.bfcInverted, ctx.startingBuildingStep];
        const sub: LDrawPartLine = [type, color, subName, matrix, state];
        parts.push(sub);
        ctx.startingBuildingStep = false;
        ctx.bfcInverted = false;
        if (!cache.has(subName)) {
          build(subName, doc.get(subName) as LDrawJson);
        }
      },

      [LineType.Line]: ([type, color, ...n]: LineLine) =>
        lines.push([type, color, vectorized(...n) as [VEC, VEC]]),

      [LineType.OptionalLine]: ([type, color, ...n]: OptLine) => {
        const [v0, v1, c0, c1] = vectorized(...n);
        optLines.push([type, color, [v0, v1], [c0, c1]]);
      },

      [LineType.Triangle]: ([type, color, ...n]: TriLine) => {
        const vecs = vectorized(...n);
        const [v0, v1, v2] = ctx.bfcCCW ? vecs : vecs.reverse();
        if (ctx.doubleSided) {
          faces.push([type, color, [v0, v1, v2]], [type, color, [v2, v1, v0]]);
        } else {
          faces.push([type, color, [v0, v1, v2]]);
        }
      },

      [LineType.Quad]: ([type, color, ...n]: QuadLine) => {
        const vecs = vectorized(...n);
        const [v0, v1, v2, v3] = ctx.bfcCCW ? vecs : vecs.reverse();
        if (ctx.doubleSided) {
          faces.push([type, color, [v0, v1, v2, v0, v2, v3]], [type, color, [
            v3,
            v2,
            v0,
            v2,
            v1,
            v0,
          ]]);
        } else {
          faces.push([type, color, [v0, v1, v2, v0, v2, v3]]);
        }
      },
    };

    for (const line of items) {
      const action = converters[line[0] as LineType];
      action(line as AllLine);
    }

    const res: LDrawDoc = [type, faces, lines, optLines, parts];
    cache.set(name, res);
    return res;
  };

  build(ROOT_MODEL, root);
  return cache;
}
