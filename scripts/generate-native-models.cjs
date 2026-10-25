// Bundle a native-renderable Earth and upright NASA models; no browser renderer is used on Android.
const fs = require("fs");
const THREE = require("three");
const destination = "android/app/src/main/assets/models/";
function readGlb(file) {
  const b = fs.readFileSync(file),
    n = b.readUInt32LE(12);
  return {
    json: JSON.parse(b.toString("utf8", 20, 20 + n)),
    binary: b.subarray(20 + n),
  };
}
function writeGlb(file, json, binary) {
  const raw = Buffer.from(JSON.stringify(json)),
    padded = Buffer.concat([raw, Buffer.alloc((4 - (raw.length % 4)) % 4, 32)]),
    header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(20 + padded.length + binary.length, 8);
  header.writeUInt32LE(padded.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  fs.writeFileSync(file, Buffer.concat([header, padded, binary]));
}
for (const slug of ["saturn-v", "atlas-mercury", "ares-i"]) {
  const { json: j, binary } = readGlb(`public/models/${slug}.glb`);
  const nodes = j.nodes.map((n, i) => {
    const o = new THREE.Object3D();
    o.userData.index = i;
    if (n.matrix) o.applyMatrix4(new THREE.Matrix4().fromArray(n.matrix));
    else {
      if (n.translation) o.position.fromArray(n.translation);
      if (n.rotation) o.quaternion.fromArray(n.rotation);
      if (n.scale) o.scale.fromArray(n.scale);
    }
    return o;
  });
  j.nodes.forEach((n, i) => n.children?.forEach((c) => nodes[i].add(nodes[c])));
  const root = new THREE.Group();
  j.scenes[j.scene || 0].nodes.forEach((i) => root.add(nodes[i]));
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  root.traverse((o) => {
    const n = j.nodes[o.userData.index];
    if (n?.mesh === undefined) return;
    for (const p of j.meshes[n.mesh].primitives) {
      const a = j.accessors[p.attributes.POSITION];
      if (a.min)
        bounds.union(
          new THREE.Box3(
            new THREE.Vector3(...a.min),
            new THREE.Vector3(...a.max)
          ).applyMatrix4(o.matrixWorld)
        );
    }
  });
  const size = bounds.getSize(new THREE.Vector3());
  if ((size.z > size.y && size.z > size.x) || size.x > size.y) {
    const q = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(size.z > size.x ? 1 : 0, 0, size.z > size.x ? 0 : 1),
      size.z > size.x ? -Math.PI / 2 : Math.PI / 2
    );
    const s = j.scenes[j.scene || 0];
    const index = j.nodes.length;
    j.nodes.push({
      name: "TZeroUpright",
      rotation: q.toArray(),
      children: s.nodes,
    });
    s.nodes = [index];
  }
  writeGlb(destination + slug + ".glb", j, binary);
}
const geometry = new THREE.SphereGeometry(1, 64, 40);
const arrays = [
  new Float32Array(geometry.attributes.position.array),
  new Float32Array(geometry.attributes.normal.array),
  new Float32Array(geometry.attributes.uv.array),
  new Uint16Array(geometry.index.array),
];
for (let i = 1; i < arrays[2].length; i += 2) arrays[2][i] = 1 - arrays[2][i];
const parts = [],
  views = [];
let offset = 0;
for (const array of arrays) {
  const buffer = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  parts.push(buffer);
  views.push({ buffer: 0, byteOffset: offset, byteLength: buffer.length });
  offset += buffer.length;
  const pad = (4 - (offset % 4)) % 4;
  if (pad) {
    parts.push(Buffer.alloc(pad));
    offset += pad;
  }
}
const texture = fs.readFileSync("public/textures/earth.jpg");
views.push({ buffer: 0, byteOffset: offset, byteLength: texture.length });
parts.push(texture);
offset += texture.length;
const pad = (4 - (offset % 4)) % 4;
if (pad) {
  parts.push(Buffer.alloc(pad));
  offset += pad;
}
const bin = Buffer.concat(parts),
  chunk = Buffer.alloc(8);
chunk.writeUInt32LE(bin.length, 0);
chunk.writeUInt32LE(0x004e4942, 4);
const j = {
  asset: { version: "2.0", generator: "T-Zero native Earth asset" },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0 }],
  meshes: [
    {
      primitives: [
        {
          attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
          indices: 3,
          material: 0,
        },
      ],
    },
  ],
  buffers: [{ byteLength: bin.length }],
  bufferViews: views,
  accessors: [
    {
      bufferView: 0,
      componentType: 5126,
      count: arrays[0].length / 3,
      type: "VEC3",
      min: [-1, -1, -1],
      max: [1, 1, 1],
    },
    {
      bufferView: 1,
      componentType: 5126,
      count: arrays[1].length / 3,
      type: "VEC3",
    },
    {
      bufferView: 2,
      componentType: 5126,
      count: arrays[2].length / 2,
      type: "VEC2",
    },
    {
      bufferView: 3,
      componentType: 5123,
      count: arrays[3].length,
      type: "SCALAR",
    },
  ],
  images: [{ bufferView: 4, mimeType: "image/jpeg" }],
  textures: [{ source: 0 }],
  materials: [
    {
      pbrMetallicRoughness: {
        baseColorTexture: { index: 0 },
        metallicFactor: 0,
        roughnessFactor: 1,
      },
      extensions: { KHR_materials_unlit: {} },
    },
  ],
  extensionsUsed: ["KHR_materials_unlit"],
};
writeGlb(destination + "earth.glb", j, Buffer.concat([chunk, bin]));
geometry.dispose();
console.log("Bundled native Earth and three upright NASA assets.");
