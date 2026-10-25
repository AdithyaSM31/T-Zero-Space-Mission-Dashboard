# T-Zero Android v1.1

T-Zero v1.1 is a native **Kotlin + Jetpack Compose** application. The `android/` project no longer depends on Capacitor, a JavaScript bundle, or a WebView. The package remains `com.tzero.app`, with `versionName = 1.1.0` and `versionCode = 2`.

## Build

Use **JDK 17**, Android SDK **API 36**, and the checked-in Gradle 8.14.3 wrapper. In Android Studio, open this directory as a project and select JDK 17 as the Gradle JDK. A newer Android Studio bundled JDK may exceed the wrapper's supported Java version.

Configure your local SDK in `local.properties` (ignored by Git):

```properties
sdk.dir=C:/Users/your-name/AppData/Local/Android/Sdk
```

Windows:

```powershell
.\gradlew.bat :app:assembleDebug :app:testDebugUnitTest
```

macOS/Linux:

```bash
sh ./gradlew :app:assembleDebug :app:testDebugUnitTest
```

From the repository root, `npm run build:android` builds and copies the installable debug APK to `releases/android/T-Zero-v1.1.0-debug.apk`, with a SHA-256 file. `npm run check:android` also runs JVM unit tests. These wrappers invoke Gradle; the native build itself does not require a JavaScript runtime.

The original Gradle output is `app/build/outputs/apk/debug/app-debug.apk`.

## Native features

The overview follows the mobile web composition: compact Workspace/source/time header, smaller introductory typography, an automatically loaded large Earth with overlaid orbital labels, and a launch countdown inset within the same bordered panel. The native Earth remains draggable and supports pinch zoom. The Earth uses an origin-centered mesh and an explicit orbit target, with a transparent native viewport, a closer camera, and a northern-hemisphere home orientation. Its framing was visually checked on the host-GPU emulator; orbit/reset is covered by a device test.

- Five Compose destinations: Overview, Launches, Fleet, History, and Analytics.
- Source-backed upcoming and recent missions, descriptions, precise-time countdowns, UTC/local display, provider/status/search/saved filters, and a monthly UTC calendar.
- Device-local bookmarks and display preferences.
- Cached launch samples shown while refreshing, explicit offline/stale/rate-limited states, and bounded recent analytics.
- Bundled fleet specifications and photographs, two-vehicle comparisons, and clearly labeled source-snapshot dates.
- Native Filament rendering of the Earth, Saturn V, Friendship 7, and Ares I GLBs. Drag to orbit and pinch to zoom; rendering follows lifecycle and view attachment. Static fallbacks remain available.
- Historical milestones, outcome calculations, native activity charts with exact-value tables, and CSV export through Android's share chooser.
- T-Zero branding, edge-to-edge layout, system splash screen, and Android launcher assets.

## Data and offline behavior

The app accesses The Space Devs API directly over HTTPS. **No deployed web backend or API key is required.** Upcoming results are cached for 60 seconds and recent samples for one hour. A refresh can request fresh data; provider rate limits still apply.

Launch data is stored in the app's private files directory. Bookmarks and display preferences use private SharedPreferences. There is no account, location permission, analytics SDK, or notification permission. APK app data is not backed up.

The modern vehicle catalog is a bundled snapshot of The Space Devs data. It does not claim live configuration statistics. Regenerate the snapshot deliberately from the source when publishing new app versions. The 3D models and Earth work independently of live launch data.

Monthly/yearly dates are excluded from individual calendar cells. Countdowns require minute/second precision and a Go status. Analytics covers at most 100 recent records; success rate excludes pending/unknown statuses and includes partial failure in its denominator.

## Verification

```powershell
.\gradlew.bat :app:testDebugUnitTest
.\gradlew.bat :app:connectedDebugAndroidTest
```

Device tests need an attached device or running emulator. They check native navigation and native resource loading. Performance and TalkBack still need physical-device validation; emulator correctness is not a 60 fps performance guarantee.

Local validation on October 25, 2026: the debug APK assembled successfully, all five JVM unit tests passed, and all three Android device tests passed on the Android 16.1 emulator using the host GPU. Device coverage includes navigation, loading Saturn V/Friendship 7/Ares I, and Earth loading/orbit/reset. The Earth composition was visually inspected. SwiftShader cannot compile the Filament post-processing shaders on this emulator image; use host GPU graphics for these checks. Physical-device performance and accessibility still need validation.

## Assets

Run `node scripts/generate-native-models.cjs` from the repository root. It copies the repaired NASA GLBs, normalizes long-axis orientation, and packages a textured Earth GLB for Filament. Kotlin and source model assets are tracked in Git; generated APKs, local SDK settings, and signing files are ignored.

See `app/src/main/assets/MODEL_CREDITS.md` and `../public/models/ATTRIBUTION.md` for NASA and imagery provenance. Source geometry is a visualization reference, not engineering data.

## Release and migration

The produced download is a **debug-signed test APK**. For a distributable release, use Android Studio's Generate Signed Bundle/APK flow with your own existing app signing key. Updates to an installed version require the same signing key. No private release signing material is included in this repository.

The v1.0 web-wrapper toolchain remains only as historical tooling outside this native project. Do not run `npx cap sync android` against this project: it can regenerate Capacitor configuration over the native setup. Existing WebView localStorage is not silently imported into the new native bookmark store.
