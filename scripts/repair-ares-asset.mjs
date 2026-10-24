import { readFileSync, writeFileSync } from "node:fs";
const path = new URL("../public/models/ares-i.glb", import.meta.url);
const bytes = readFileSync(path),
  length = bytes.readUInt32LE(12);
const asset = JSON.parse(bytes.toString("utf8", 20, 20 + length));
// The B export contains four untransformed duplicates outside its rotated 3DSRoot.
// Their correctly transformed counterparts already exist in the vehicle hierarchy.
const duplicates = new Set([
  "group2 pCo",
  "group3 pCo",
  "pCone1 gro",
  "pCone1 gr1",
]);
for (const scene of asset.scenes)
  scene.nodes = scene.nodes.filter(
    (index) => !duplicates.has(asset.nodes[index].name)
  );
asset.asset.extras = {
  ...asset.asset.extras,
  repair:
    "Removed four loose duplicate escape-motor nodes; retained the complete transformed Ares I vehicle hierarchy and original materials.",
};
const json = Buffer.from(JSON.stringify(asset));
const padded = Buffer.concat([
  json,
  Buffer.alloc((4 - (json.length % 4)) % 4, 0x20),
]);
const binary = bytes.subarray(20 + length);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(20 + padded.length + binary.length, 8);
header.writeUInt32LE(padded.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
writeFileSync(path, Buffer.concat([header, padded, binary]));
console.log(
  "Ares I: retained transformed vehicle root and removed loose export duplicates."
);
