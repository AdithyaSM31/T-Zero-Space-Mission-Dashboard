# T-Zero Android v1.1

T-Zero v1.1 is a native **Kotlin + Jetpack Compose** application. The `android/` project no longer depends on Capacitor, a JavaScript bundle, or a WebView. The package remains `com.tzero.app`, with `versionName = 1.1.3` and `versionCode = 5`.

## Smooth scrolling and adaptive refresh (v1.1.1)

Use `npm run build:android:preview` from the repository root for the optimized, non-debuggable, R8-shrunk test APK (`releases/android/T-Zero-v1.1.3-preview.apk`). It uses the local debug signing key so it can replace a test installation signed by that key. Production release signing remains separate. Evaluate scrolling performance with this preview build rather than the development debug variant.

Android 15+ receives a HIGH adaptive frame-rate vote on both the Compose view and native 3D texture view. Earlier Android versions receive the highest supported refresh-rate preference at the display's current resolution; preferences update when displays change and clear when the activity pauses. These are system hints: device display settings, battery saver, thermal policy, and workload still determine actual FPS. No fixed 30/60/90/120 FPS timer is used.

The native renderer follows display vsync during loading and interaction. Static models stop requesting frames after gestures settle; offscreen and paused viewers stop rendering. This avoids continuous GPU work competing with list scrolling. The displayed model frame remains available while idle.

Validation on October 26, 2026: optimized preview APK built successfully; five JVM tests and four Android device tests passed (including adaptive refresh voting and overview scrolling). The optimized APK was separately installed, launched, and visually checked with no runtime errors. APK signing verification confirms the same signing certificate as v1.1.0. The emulator does not establish 90/120 Hz performance on a physical handset.

## Launch-site marker and Earth shading (v1.1.2)

The overview globe uses the featured mission's source-provided launch-pad latitude and longitude. A small pale marker is part of the 3D scene, shares Earth's rotation, and is hidden by the globe when it is on the far side. The initial orientation brings the selected site towards the camera. Missing or invalid coordinates do not produce a fabricated marker.

Earth now uses a darker, lit material rather than an unlit texture, with a directional key light and softer ambient illumination for visible spherical depth. The adaptive refresh and idle-rendering improvements remain. Seven JVM tests and all four Android device tests passed; the real Vandenberg marker and darker globe were visually checked in the emulator.

## Earth shadow artifacts (v1.1.3)

The Earth viewport disables shadow mapping to prevent concentric self-shadow artifacts on the curved mesh when orbiting. Directional/ambient lighting and surface-normal shading remain enabled, preserving its darker appearance and depth. The location marker still uses normal depth occlusion. Heritage-model shadow settings are unchanged. Seven JVM tests and four device tests pass; the optimized APK was separately rotated and visually inspected using native screen captures.

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

From the repository root, `npm run build:android` builds and copies the installable debug APK to `releases/android/T-Zero-v1.1.3-debug.apk`, with a SHA-256 file. `npm run check:android` also runs JVM unit tests. These wrappers invoke Gradle; the native build itself does not require a JavaScript runtime.

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
