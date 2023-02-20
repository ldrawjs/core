import { LineType } from "./consts.ts";

export type N = number;
export type C = number;
export type PART = string;

/**
 * LDraw File Format Specification
 *
 * Line Types
 * @see https://www.ldraw.org/article/218.html#linetypes
 *
 * LDrawJson
 * @see TBC
 */
export type MetaLine = [LineType.Meta, ...string[]];
export type PartLine = [
  LineType.Part,
  C,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  PART,
];
export type LineLine = [LineType.Line, C, N, N, N, N, N, N];
export type TriLine = [LineType.Triangle, C, N, N, N, N, N, N, N, N, N];
export type QuadLine = [LineType.Quad, C, N, N, N, N, N, N, N, N, N, N, N, N];
export type OptLine = [
  LineType.OptionalLine,
  C,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
  N,
];

export type ShapeLine = LineLine | TriLine | QuadLine | OptLine;
export type AnyLine =
  | MetaLine
  | PartLine
  | LineLine
  | TriLine
  | QuadLine
  | OptLine;
export type AllLine =
  & MetaLine
  & PartLine
  & LineLine
  & TriLine
  & QuadLine
  & OptLine;
export type LDrawJson = AnyLine[];

/**
 * Collector / Fetcher
 *
 * Collected
 * CollectedRaw
 * @see TBC
 */
export type Fetcher = (part: string) => Promise<LDrawJson>;
export type Collected = Map<string, LDrawJson>;
export type CollectedRaw = [string, LDrawJson][];

/**
 * LDrawDoc / LDrawDocuments
 * @see TBC (THREE)
 */
export type LDrawPartLine<M = any> = [LineType.Part, C, PART, M, boolean[]];
export type LDrawLineLine<V = any> = [LineType.Line, C, [V, V]];
export type LDrawTriLine<V = any> = [LineType.Triangle, C, [V, V, V]];
export type LDrawQuadLine<V = any> = [
  LineType.Quad,
  C,
  [V, V, V, V, V, V],
];
export type LDrawOptLine<V = any> = [
  LineType.OptionalLine,
  C,
  [V, V],
  [V, V],
];

export type LDrawFaced = LDrawTriLine | LDrawQuadLine;

// todo add steps support
// export type LDrawDocStep = [LDrawFaced[], LDrawLineLine[], LDrawOptLine[], LDrawPartLine[]];
// export type LDrawDoc = [PART, LDrawDocStep[]];
export type LDrawDoc = [
  PART,
  LDrawFaced[],
  LDrawLineLine[],
  LDrawOptLine[],
  LDrawPartLine[],
];
export type LDrawDocuments = Map<string, LDrawDoc>;
