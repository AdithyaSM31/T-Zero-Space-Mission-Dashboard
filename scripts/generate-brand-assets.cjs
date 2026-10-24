const sharp = require("sharp");
const fs = require("node:fs");
(async () => {
  const source = "public/brand/tzero-logo-master.png";
  await sharp(source)
    .resize(512, 512)
    .png()
    .toFile("public/brand/tzero-logo.png");
  await sharp(source)
    .resize(128, 128)
    .png()
    .toFile("public/brand/tzero-icon.png");
  await sharp(source)
    .resize(180, 180)
    .png()
    .toFile("public/brand/apple-touch-icon.png");
  const icon = await sharp(source)
    .resize(256, 256)
    .ensureAlpha()
    .png()
    .toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(icon.length, 14);
  header.writeUInt32LE(22, 18);
  fs.writeFileSync("src/app/favicon.ico", Buffer.concat([header, icon]));
  fs.copyFileSync("public/brand/tzero-logo.png", "logo.png");
  await sharp(source).resize(1024, 1024).png().toFile("assets/logo.png");
  const splashLogo = await sharp(source).resize(1152, 1152).png().toBuffer();
  await sharp({
    create: { width: 2732, height: 2732, channels: 4, background: "#080c12" },
  })
    .composite([{ input: splashLogo, gravity: "center" }])
    .png()
    .toFile("assets/splash.png");
})();
