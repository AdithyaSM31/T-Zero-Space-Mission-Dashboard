# Third-party visual assets

## NASA heritage collection
NASA distributes the following models through [NASA 3D Resources](https://github.com/nasa/NASA-3D-Resources). Its repository describes these resources as free and without copyright. NASA's [Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) apply. Credit is provided in the viewer; NASA endorsement is not implied. Agency insignia embedded in the original model are not used as T-Zero branding.

| Local GLB and preview | NASA repository source | Model credit |
| --- | --- | --- |
| `saturn-v.glb`, `saturn-v.png` | [Saturn V](https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Saturn%20V) | NASA / Michael D. Carbajal |
| `atlas-mercury.glb`, `atlas-mercury.png` | [Atlas 6 (Friendship 7)](https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Atlas%206%20(Friendship%207)) | NASA 3D Resources |
| `ares-i.glb`, `ares-i.png` | [Ares 1 (B)](https://github.com/nasa/NASA-3D-Resources/tree/master/3D%20Models/Ares%201%20(B)) | NASA 3D Resources |

These are NASA-derived GLB assets, approximately 96 KB, 906 KB, and 1 MB, loaded on demand. The viewer normalizes orientation and display size. It does not claim engineering accuracy or common physical scale across individual 3D previews. The modern fleet comparison uses source-reported heights on a common linear bar scale.

The Saturn V staging diagram is original HTML/CSS educational artwork. It illustrates the sequence of stage separation, not actual trajectories, timings, or distances.

## Earth
`public/textures/earth.jpg`: NASA surface imagery distributed by [webgl-earth](https://github.com/turban/webgl-earth/blob/master/images/2_no_clouds_4k.jpg).

## Fleet photography
Remote fleet photographs and specifications are supplied by The Space Devs API. Photo failures show an explicit fallback rather than a substitute vehicle.

Draco decoding uses the decoder distributed with Three.js under its bundled license. The decoder is served locally from public/draco. The Atlas 6 asset depicts the Friendship 7 spacecraft, not the complete Atlas rocket.

## Material repair

Ares I now uses NASA's [Ares 1 (B)](https://science.nasa.gov/3d-resources/ares-1-b/) source, credited to NASA / Michael D. Carbajal. It retains the original multicolor material assignments, unlike the monochrome A variant.

Friendship 7 retains the original NASA mesh and binary geometry. `scripts/restore-capsule-materials.mjs` restores distinct, reference-based dark exterior, metal, window, and heat-shield finishes to the material slots. These finishes are an authored visualization, not original archival textures. Reference: [Smithsonian Friendship 7 collection record](https://airandspace.si.edu/collection-objects/capsule-mercury-ma-6/nasm_A19670176000). The original source GLB assigned the same gray color to every material.


The Ares I B scene also contained four loose, unrotated duplicates of escape-motor parts. `scripts/repair-ares-asset.mjs` excludes these duplicate scene roots while retaining the complete transformed vehicle hierarchy and original material assignments. This repairs framing and removes the floating fragments. Updated PNG previews are captured from the repaired viewer.
