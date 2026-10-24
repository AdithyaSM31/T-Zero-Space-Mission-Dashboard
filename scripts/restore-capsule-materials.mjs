import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const path = new URL("../public/models/atlas-mercury.glb", import.meta.url);
const original = readFileSync(path);
const jsonLength = original.readUInt32LE(12);
const model = JSON.parse(original.toString("utf8", 20, 20 + jsonLength));
// NASA's export retained material assignments but replaced every color with the same gray.
// Restore distinct reference-based finishes without changing vertices, UVs, or mesh assignments.
const finishes = {
  blinn2SG: { color: [0.022, 0.026, 0.033, 1], metal: 0.38, rough: 0.6 },
  lambert3SG: { color: [0.016, 0.019, 0.025, 1], metal: 0.3, rough: 0.66 },
  lambert2SG: { color: [0.36, 0.39, 0.42, 1], metal: 0.75, rough: 0.4 },
  blinn5SG: { color: [0.035, 0.042, 0.052, 1], metal: 0.5, rough: 0.46 },
  anisotropic1SG: { color: [0.015, 0.05, 0.08, 1], metal: 0.4, rough: 0.12 },
  lambert6SG: { color: [0.055, 0.029, 0.018, 1], metal: 0.02, rough: 0.93 },
  blinn6SG: { color: [0.17, 0.19, 0.21, 1], metal: 0.65, rough: 0.38 },
  blinn1SG: { color: [0.018, 0.022, 0.028, 1], metal: 0.32, rough: 0.64 },
  blinn3SG: { color: [0.42, 0.45, 0.48, 1], metal: 0.8, rough: 0.33 },
};
for (const material of model.materials) {
  const finish = finishes[material.name.split(".")[0]];
  if (!finish)
    throw new Error(`Unrecognized capsule material: ${material.name}`);
  material.pbrMetallicRoughness = {
    baseColorFactor: finish.color,
    metallicFactor: finish.metal,
    roughnessFactor: finish.rough,
  };
  // The imported specular extension used values above 1 and washed out the capsule's details.
  delete material.extensions?.KHR_materials_specular;
}
model.asset.extras = {
  ...model.asset.extras,
  materialRestoration:
    "T-Zero reference-based visualization; original NASA geometry preserved. Not an archival texture reproduction.",
};
const json = Buffer.from(JSON.stringify(model));
const padding = (4 - (json.length % 4)) % 4;
const padded = Buffer.concat([json, Buffer.alloc(padding, 0x20)]);
const remainder = original.subarray(20 + jsonLength);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(20 + padded.length + remainder.length, 8);
header.writeUInt32LE(padded.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
writeFileSync(path, Buffer.concat([header, padded, remainder]));
console.log(
  "Capsule geometry buffer preserved:",
  createHash("sha256").update(remainder).digest("hex")
);
