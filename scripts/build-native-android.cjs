const { spawnSync } = require("node:child_process");
const {
  existsSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  writeFileSync,
} = require("node:fs");
const { resolve } = require("node:path");
const { createHash } = require("node:crypto");
const root = resolve(__dirname, "..");
const tasks = [":app:assembleDebug"];
if (process.argv.includes("--test")) tasks.push(":app:testDebugUnitTest");
if (process.argv.includes("--connected"))
  tasks.push(":app:connectedDebugAndroidTest");
const windows = process.platform === "win32";
const args = windows
  ? ["/d", "/s", "/c", `gradlew.bat ${tasks.join(" ")} --console=plain`]
  : ["./gradlew", ...tasks, "--console=plain"];
const result = spawnSync(windows ? "cmd.exe" : "sh", args, {
  cwd: resolve(root, "android"),
  stdio: "inherit",
  env: process.env,
});
if (result.status !== 0) process.exit(result.status || 1);
const original = resolve(
  root,
  "android/app/build/outputs/apk/debug/app-debug.apk"
);
if (!existsSync(original))
  throw new Error("Gradle succeeded but the debug APK is missing.");
const output = resolve(root, "releases/android");
mkdirSync(output, { recursive: true });
const file = resolve(output, "T-Zero-v1.1.0-debug.apk");
copyFileSync(original, file);
const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
writeFileSync(`${file}.sha256`, `${hash}  T-Zero-v1.1.0-debug.apk\n`);
console.log(`\nNative Kotlin APK: ${file}\nSHA-256: ${hash}`);
