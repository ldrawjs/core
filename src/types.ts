import { LineType } from './consts';
import { Matrix4, Vector3 } from 'three';

// LDrawJson raw document

export type N = number;
export type C = number;
export type PART = string;

export type MetaLine = [LineType.Meta, ...string[]];
export type PartLine = [LineType.Part, C, N, N, N, N, N, N, N, N, N, N, N, N, PART];
export type LineLine = [LineType.Line, C, N, N, N, N, N, N];
export type TriLine = [LineType.Triangle, C, N, N, N, N, N, N, N, N, N];
export type QuadLine = [LineType.Quad, C, N, N, N, N, N, N, N, N, N, N, N, N];
export type OptLine = [LineType.OptionalLine, C, N, N, N, N, N, N, N, N, N, N, N, N];

export type ShapeLine = LineLine | TriLine | QuadLine | OptLine;
export type AnyLine = MetaLine | PartLine | LineLine | TriLine | QuadLine | OptLine;
export type LDrawJson = AnyLine[];

// Fetcher

export type Fetcher = (part: string) => Promise<LDrawJson>;
export type Collected = Map<string, LDrawJson>;

// LDrawDoc

export type LDrawMetaLine = [LineType.Meta, ...string[]];
export type LDrawPartLine = [LineType.Part, C, PART, Matrix4, boolean[]];
export type LDrawLineLine = [LineType.Line, C, [Vector3, Vector3]];
export type LDrawTriLine = [LineType.Triangle, C, [Vector3, Vector3, Vector3]];
export type LDrawQuadLine = [LineType.Quad, C, [Vector3, Vector3, Vector3, Vector3, Vector3, Vector3]];
export type LDrawOptLine = [LineType.OptionalLine, C, [Vector3, Vector3], [Vector3, Vector3]];

export type LDrawFaced = LDrawTriLine | LDrawQuadLine;

export type LDrawDoc = [PART, LDrawFaced[], LDrawLineLine[], LDrawOptLine[], LDrawPartLine[]];
export type LDrawDocuments = Map<string, LDrawDoc>;
