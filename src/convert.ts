import type {
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
    TriLine
} from './types';
import { LineType, ROOT_MODEL } from './consts';
import ParserContext from './utils/parser-context';

export default function convert(doc: Collected): LDrawDocuments {
    const root = doc.get(ROOT_MODEL) as LDrawJson;
    const cache = new Map<string, LDrawDoc>();
    const ctx = new ParserContext();

    const build = (name: string, items: LDrawJson): LDrawDoc => {
        let type = '';
        const parts: LDrawPartLine[] = [];
        const faces: LDrawFaced[] = [];
        const lines: LDrawLineLine[] = [];
        const optLines: LDrawOptLine[] = [];

        for (const line of items) {
            switch (line[0] as LineType) {
                case LineType.Meta:
                    ctx.meta(line as MetaLine);
                    type = ctx.type;
                    break;

                case LineType.Part:
                    const sub = ctx.part(line as PartLine);
                    parts.push(sub);
                    const subName = sub[2];
                    if (!cache.has(subName)) {
                        build(subName, doc.get(subName) as LDrawJson);
                    }
                    break;

                case LineType.Line:
                    lines.push(ctx.line(line as LineLine));
                    break;

                case LineType.OptionalLine:
                    optLines.push(ctx.optLine(line as OptLine));
                    break;

                case LineType.Triangle:
                    const triangles = ctx.triangle(line as TriLine);
                    faces.push(...triangles);
                    break;

                case LineType.Quad:
                    const quad = ctx.quad(line as QuadLine);
                    faces.push(...quad);
                    break;
            }
        }

        const res: LDrawDoc = [type, faces, lines, optLines, parts];
        cache.set(name, res);
        return res;
    };

    build(ROOT_MODEL, root);
    return cache;
}
