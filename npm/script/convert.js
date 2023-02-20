"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_js_1 = require("./consts.js");
const three_js_1 = require("./three.js");
class ParserContext {
    constructor() {
        Object.defineProperty(this, "bfcCertified", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "bfcCCW", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "bfcInverted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "bfcCull", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "startingBuildingStep", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    get doubleSided() {
        return !this.bfcCertified || !this.bfcCull;
    }
}
async function convert(doc) {
    const root = doc.get(consts_js_1.ROOT_MODEL);
    const cache = new Map();
    const ctx = new ParserContext();
    const vectorized = (...points) => {
        const vec = [];
        while (points.length) {
            const [x, y, z] = points.splice(0, 3);
            vec.push(new three_js_1.Vector3(x, y, z));
        }
        return vec;
    };
    const build = (name, items) => {
        let type = "";
        const parts = [];
        const faces = [];
        const lines = [];
        const optLines = [];
        const converters = {
            [consts_js_1.LineType.Meta]: ([_, meta, ...values]) => {
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
            [consts_js_1.LineType.Part]: ([type, color, posX, posY, posZ, m0, m1, m2, m3, m4, m5, m6, m7, m8, subName,]) => {
                const matrix = new three_js_1.Matrix4().set(m0, m1, m2, posX, m3, m4, m5, posY, m6, m7, m8, posZ, 0, 0, 0, 1);
                const state = [ctx.bfcInverted, ctx.startingBuildingStep];
                const sub = [type, color, subName, matrix, state];
                parts.push(sub);
                ctx.startingBuildingStep = false;
                ctx.bfcInverted = false;
                if (!cache.has(subName)) {
                    build(subName, doc.get(subName));
                }
            },
            [consts_js_1.LineType.Line]: ([type, color, ...n]) => lines.push([type, color, vectorized(...n)]),
            [consts_js_1.LineType.OptionalLine]: ([type, color, ...n]) => {
                const [v0, v1, c0, c1] = vectorized(...n);
                optLines.push([type, color, [v0, v1], [c0, c1]]);
            },
            [consts_js_1.LineType.Triangle]: ([type, color, ...n]) => {
                const vecs = vectorized(...n);
                const [v0, v1, v2] = ctx.bfcCCW ? vecs : vecs.reverse();
                if (ctx.doubleSided) {
                    faces.push([type, color, [v0, v1, v2]], [type, color, [v2, v1, v0]]);
                }
                else {
                    faces.push([type, color, [v0, v1, v2]]);
                }
            },
            [consts_js_1.LineType.Quad]: ([type, color, ...n]) => {
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
                }
                else {
                    faces.push([type, color, [v0, v1, v2, v0, v2, v3]]);
                }
            },
        };
        for (const line of items) {
            const action = converters[line[0]];
            action(line);
        }
        const res = [type, faces, lines, optLines, parts];
        cache.set(name, res);
        return res;
    };
    build(consts_js_1.ROOT_MODEL, root);
    return cache;
}
exports.default = convert;
