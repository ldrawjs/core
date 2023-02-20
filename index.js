// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var LineType;
(function(LineType) {
    LineType[LineType["Meta"] = 0] = "Meta";
    LineType[LineType["Part"] = 1] = "Part";
    LineType[LineType["Line"] = 2] = "Line";
    LineType[LineType["Triangle"] = 3] = "Triangle";
    LineType[LineType["Quad"] = 4] = "Quad";
    LineType[LineType["OptionalLine"] = 5] = "OptionalLine";
})(LineType || (LineType = {}));
const ROOT_MODEL = "__root__";
async function collect(doc, fetcher) {
    const parts = new Map();
    const getParts = (lines)=>lines.filter((line)=>line[0] === LineType.Part).map((line)=>line[14]).filter((part)=>!parts.has(part));
    const collect = async (name, lines)=>{
        parts.set(name, lines);
        for (const part of getParts(lines)){
            await collect(part, await fetcher(part));
        }
    };
    await collect(ROOT_MODEL, doc);
    return parts;
}
function three() {
    return import("https://esm.sh/three").then(({ BufferGeometry , Group , Line , LineBasicMaterial , Matrix4 , Mesh , MeshBasicMaterial , Vector3  })=>({
            BufferGeometry,
            Group,
            Line,
            LineBasicMaterial,
            Matrix4,
            Mesh,
            MeshBasicMaterial,
            Vector3
        }));
}
class ParserContext {
    bfcCertified = false;
    bfcCCW = true;
    bfcInverted = false;
    bfcCull = true;
    startingBuildingStep = false;
    get doubleSided() {
        return !this.bfcCertified || !this.bfcCull;
    }
}
async function convert(doc) {
    const { Matrix4 , Vector3  } = await three();
    const root = doc.get(ROOT_MODEL);
    const cache = new Map();
    const ctx = new ParserContext();
    const vectorized = (...points)=>{
        const vec = [];
        while(points.length){
            const [x, y, z] = points.splice(0, 3);
            vec.push(new Vector3(x, y, z));
        }
        return vec;
    };
    const build = (name, items)=>{
        let type = "";
        const parts = [];
        const faces = [];
        const lines = [];
        const optLines = [];
        const converters = {
            [LineType.Meta]: ([_, meta, ...values])=>{
                switch(meta){
                    case "!LDRAW_ORG":
                        type = values[0];
                        break;
                    case "!COLOUR":
                        break;
                    case "FILE":
                        break;
                    case "BFC":
                        for (const token of values){
                            switch(token){
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
            [LineType.Part]: ([type, color, posX, posY, posZ, m0, m1, m2, m3, m4, m5, m6, m7, m8, subName])=>{
                const matrix = new Matrix4().set(m0, m1, m2, posX, m3, m4, m5, posY, m6, m7, m8, posZ, 0, 0, 0, 1);
                const state = [
                    ctx.bfcInverted,
                    ctx.startingBuildingStep
                ];
                const sub = [
                    type,
                    color,
                    subName,
                    matrix,
                    state
                ];
                parts.push(sub);
                ctx.startingBuildingStep = false;
                ctx.bfcInverted = false;
                if (!cache.has(subName)) {
                    build(subName, doc.get(subName));
                }
            },
            [LineType.Line]: ([type, color, ...n])=>lines.push([
                    type,
                    color,
                    vectorized(...n)
                ]),
            [LineType.OptionalLine]: ([type, color, ...n])=>{
                const [v0, v1, c0, c1] = vectorized(...n);
                optLines.push([
                    type,
                    color,
                    [
                        v0,
                        v1
                    ],
                    [
                        c0,
                        c1
                    ]
                ]);
            },
            [LineType.Triangle]: ([type, color, ...n])=>{
                const vecs = vectorized(...n);
                const [v0, v1, v2] = ctx.bfcCCW ? vecs : vecs.reverse();
                if (ctx.doubleSided) {
                    faces.push([
                        type,
                        color,
                        [
                            v0,
                            v1,
                            v2
                        ]
                    ], [
                        type,
                        color,
                        [
                            v2,
                            v1,
                            v0
                        ]
                    ]);
                } else {
                    faces.push([
                        type,
                        color,
                        [
                            v0,
                            v1,
                            v2
                        ]
                    ]);
                }
            },
            [LineType.Quad]: ([type, color, ...n])=>{
                const vecs = vectorized(...n);
                const [v0, v1, v2, v3] = ctx.bfcCCW ? vecs : vecs.reverse();
                if (ctx.doubleSided) {
                    faces.push([
                        type,
                        color,
                        [
                            v0,
                            v1,
                            v2,
                            v0,
                            v2,
                            v3
                        ]
                    ], [
                        type,
                        color,
                        [
                            v3,
                            v2,
                            v0,
                            v2,
                            v1,
                            v0
                        ]
                    ]);
                } else {
                    faces.push([
                        type,
                        color,
                        [
                            v0,
                            v1,
                            v2,
                            v0,
                            v2,
                            v3
                        ]
                    ]);
                }
            }
        };
        for (const line of items){
            const action = converters[line[0]];
            action(line);
        }
        const res = [
            type,
            faces,
            lines,
            optLines,
            parts
        ];
        cache.set(name, res);
        return res;
    };
    build(ROOT_MODEL, root);
    return cache;
}
async function generate(docs) {
    const { BufferGeometry , Group , Line , LineBasicMaterial , Mesh , MeshBasicMaterial  } = await three();
    const root = docs.get(ROOT_MODEL);
    const cache = new Map();
    const build = (name, [_, faces, lines, optLines, parts])=>{
        const group = new Group();
        for (const [_1, c, partName, matrix] of parts){
            const part = cache.has(partName) ? cache.get(partName) : build(partName, docs.get(partName));
            const g = part.clone();
            g.applyMatrix4(matrix);
            group.add(g);
        }
        for (const [_2, c1, vecs] of lines){
            const material = new LineBasicMaterial({
                color: 0xff0000
            });
            const geometry = new BufferGeometry().setFromPoints(vecs);
            const line = new Line(geometry, material);
            group.add(line);
        }
        for (const [_3, c2, vecs1, controls] of optLines){
            const material1 = new LineBasicMaterial({
                color: 0xffff00
            });
            const geometry1 = new BufferGeometry().setFromPoints(vecs1);
            const line1 = new Line(geometry1, material1);
            group.add(line1);
        }
        for (const [_4, c3, vecs2] of faces){
            const material2 = new MeshBasicMaterial({
                color: 0x0000ff
            });
            const geometry2 = new BufferGeometry().setFromPoints(vecs2);
            group.add(new Mesh(geometry2, material2));
        }
        cache.set(name, group);
        return group;
    };
    return build(ROOT_MODEL, root);
}
function parse(ldrawString) {
    return ldrawString.split("\n").map((line)=>line.trim()).filter((line)=>"" !== line).map((line)=>line.split(/\s+/)).map(([type, ...parts])=>{
        const t = parseFloat(type);
        if (0 === t) {
            return [
                t,
                ...parts
            ];
        }
        if (1 === t) {
            const part = parts.pop();
            return [
                t,
                ...parts.map((t)=>parseFloat(t)),
                part
            ];
        }
        return [
            t,
            ...parts.map((t)=>parseFloat(t))
        ];
    });
}
export { collect as collect, convert as convert, generate as generate, parse as parse };

