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
export { collect as collect, parse as parse };

