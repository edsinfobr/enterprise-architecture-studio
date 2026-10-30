import fs from "node:fs";

const c4 = fs.readFileSync("src/data/c4.ts", "utf8");
const am = fs.readFileSync("src/data/archimate.ts", "utf8");
const re = /key:\s*"([^"]+)"/g;
const keys = new Set(
  [...c4.matchAll(re)].map((m) => m[1]).concat([...am.matchAll(re)].map((m) => m[1]))
);

const dir = "./case-arquiteto-banco";
let bad = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8"));
  for (const n of d.nodes) {
    if (!keys.has(n.defKey)) {
      console.log("MISSING defKey", n.defKey, "in", f);
      bad++;
    }
  }
}
console.log(
  bad === 0 ? `All defKeys valid (${keys.size} known keys)` : `${bad} missing`
);
