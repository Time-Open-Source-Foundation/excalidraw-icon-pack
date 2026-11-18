"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = __dirname;
const output = path.join(root, "packs");
const controls = new Map();
const element = () => ({
  add() {}, addEventListener() {}, value: "", innerHTML: "", textContent: "",
  classList: { toggle() {} },
});
const document = {
  getElementById(id) {
    if (!controls.has(id)) controls.set(id, element());
    return controls.get(id);
  },
};
const context = vm.createContext({
  document, window: {}, Option: function () {}, structuredClone, console,
});
vm.runInContext(fs.readFileSync(path.join(root, "studio.js"), "utf8"), context, { filename: "studio.js" });
const studio = context.window.Fieldnotes;
fs.mkdirSync(output, { recursive: true });
const results = [];
for (const pack of studio.packs) {
  const built = studio.getPack(pack.id);
  const report = studio.validate(pack.id);
  if (report.errors.length) throw new Error(`${pack.id}: ${report.errors.join("; ")}`);
  const stem = studio.slug(pack);
  for (const [extension, value] of [["excalidraw", built.scene], ["excalidrawlib", built.library]]) {
    const target = path.join(output, `${stem}.${extension}`);
    fs.writeFileSync(target, JSON.stringify(value, null, 2) + "\n");
    const restored = JSON.parse(fs.readFileSync(target, "utf8"));
    if (restored.type !== value.type) throw new Error(`Export verification failed: ${target}`);
  }
  const preview = `<svg xmlns="http://www.w3.org/2000/svg" width="${built.width}" height="${built.height}" viewBox="0 0 ${built.width} ${built.height}"><rect width="100%" height="100%" fill="white"/>${built.scene.elements.map(studio.svgElement).join("")}</svg>`;
  fs.writeFileSync(path.join(output, `${stem}-preview.svg`), preview + "\n");
  results.push({
    ...report, title: pack.title, scope: pack.scope, version: pack.version,
    status: "exported-awaiting-excalidraw-review",
    concepts: pack.icons.map(icon => ({ name: icon.name, meaning: icon.meaning })),
    files: [`${stem}.excalidraw`, `${stem}.excalidrawlib`, `${stem}-preview.svg`],
  });
}
fs.writeFileSync(path.join(root, "catalog.json"), JSON.stringify({
  brand: "Fieldnotes", license: "MIT", targetPacks: 300,
  exportedPacks: results.length, exportedIcons: results.reduce((n, p) => n + p.icons, 0),
  packs: results,
}, null, 2) + "\n");
console.log(JSON.stringify({ packs: results.length, icons: results.reduce((n, p) => n + p.icons, 0), output, validationErrors: results.flatMap(p => p.errors) }));
