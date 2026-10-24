import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
function glb(slug) {
  const bytes = readFileSync(
    new URL(`../public/models/${slug}.glb`, import.meta.url)
  );
  const length = bytes.readUInt32LE(12);
  return {
    json: JSON.parse(bytes.toString("utf8", 20, 20 + length)),
    binary: bytes.subarray(20 + length),
  };
}
test("Friendship 7 retains NASA geometry while restoring distinct surface finishes", () => {
  const { json, binary } = glb("atlas-mercury");
  assert.equal(
    createHash("sha256").update(binary).digest("hex"),
    "7ef12cfc813293f276eb98f1e2e700054b77a0279adfb8de759f6b413df8c407"
  );
  const materials = json.materials.map(
    (material) => material.pbrMetallicRoughness
  );
  assert.ok(
    new Set(
      materials.map((material) => JSON.stringify(material.baseColorFactor))
    ).size >= 6
  );
  assert.ok(materials.some((material) => material.metallicFactor > 0.7));
  assert.ok(materials.some((material) => material.roughnessFactor > 0.9));
});
test("Ares I uses the colored NASA variant rather than the uniform-gray export", () => {
  const { json } = glb("ares-i");
  const colors = json.materials.map(
    (material) => material.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1]
  );
  assert.ok(new Set(colors.map((color) => JSON.stringify(color))).size >= 6);
  assert.ok(colors.some(([r, g, b]) => r > g * 1.4 && g > b));
  assert.ok(colors.some(([r, g, b]) => r < 0.05 && g < 0.05 && b < 0.05));
});
test("Ares I framing excludes loose unrotated duplicate fragments", () => {
  const { json } = glb("ares-i");
  for (const scene of json.scenes) {
    assert.ok(scene.nodes.length > 0);
    assert.ok(
      scene.nodes.every((index) => json.nodes[index].children?.length > 0)
    );
  }
});
