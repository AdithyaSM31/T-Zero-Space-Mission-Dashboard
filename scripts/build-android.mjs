import { spawnSync } from "node:child_process";
import { existsSync, renameSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const backend = process.env.NEXT_PUBLIC_API_URL;
if (!check && (!backend || !/^https:\/\//.test(backend))) {
  console.error(
    "Set NEXT_PUBLIC_API_URL to the HTTPS origin of your deployed T-Zero API before building the Android frontend."
  );
  process.exit(1);
}
const api = resolve(root, "src/app/api");
const parked = resolve(root, ".android-build-api");
if (existsSync(parked))
  throw new Error(
    "A prior Android build left .android-build-api. Restore it to src/app/api before retrying."
  );
// Server routes cannot be exported into the native WebView. Restore them even after build failure.
renameSync(api, parked);
let result;
try {
  result = spawnSync(
    process.execPath,
    [resolve(root, "node_modules/next/dist/bin/next"), "build"],
    {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        BUILD_TARGET: "android",
        NEXT_PUBLIC_API_URL: backend || "https://example.invalid",
      },
    }
  );
} finally {
  renameSync(parked, api);
}
if (check && result?.status === 0)
  console.log(
    "Android static export verified. This check uses a placeholder API and is not a release build."
  );
process.exit(result?.status ?? 1);
