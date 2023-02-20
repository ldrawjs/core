import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

const raw = await Deno.readTextFile("./scripts/package.json");
const pkg = JSON.parse(raw);

await emptyDir("./npm");

await build({
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    typeCheck: false,
    test: false,
    skipSourceOutput: true,
    shims: {
    },
    mappings: {
        "https://esm.sh/three": {
            name: "three",
            version: "^0.149.0",
            peerDependency: true
        }
    },
    package: {
        // package.json properties
        name: pkg.name,
        version: pkg.version,
        description: pkg.description,
        license: pkg.license,
        repository: pkg.repository,
        bugs: pkg.bugs
    },
});
