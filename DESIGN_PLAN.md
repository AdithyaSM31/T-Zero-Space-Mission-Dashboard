# T-Zero redesign — Orbital Command

## Implemented

- Mission-control overview with interactive Earth, launch-site selection, eased globe transitions, real schedules, UTC/local display, mission details, and local bookmarks.
- Launch Center: URL-backed search, provider/status/saved filters, list/calendar switching, month navigation, mission briefs, and shared bookmarks. Approximate month/year dates are not pinned to calendar days.
- Fleet Explorer: source-backed vehicle dossiers and photos, manufacturer search, two-vehicle comparison, specification table, and height bars on a common linear scale. Missing values are explicit.
- NASA heritage collection: local Saturn V, Friendship 7 capsule, and Ares I GLBs, local Draco decoder, static preview fallback, pause/rotate/zoom/reset controls, and keyboard-accessible component focus. Friendship 7 is labeled as a spacecraft, not its Atlas launch vehicle.
- Saturn V educational stage-separation schematic, with assembled/first-separation/second-separation states and clear illustration labels.
- Mission History: recent-launch timeline, provider/outcome/search filters, mission briefs, and four curated NASA-linked milestones.
- Analytics: provider/date filters, sample coverage dates, correct classified-outcome denominator, provider/vehicle rankings, UTC-day activity chart, accessible chart-data table, and CSV export with spreadsheet-formula escaping.
- Shared loading/error/empty/retry states, explicit provider throttling, request timeouts, bounded endpoint limits, and normalized shared launch caching. Raw detailed provider payloads exceed Next.js's 2 MB cache-item limit; only the fields used by T-Zero are cached and sent to clients.
- Static Android export script that temporarily excludes server routes and always restores them on normal build exit, with a dedicated Android TypeScript configuration and backend-origin requirement for release exports.

## Verification

- `npm test`: four tests for outcome classification, the success-rate denominator, empty data, and date precision in calendars.
- TypeScript checks passed during implementation.
- Android static-export check passed for all five frontend routes with a deliberately unusable placeholder backend. This output is validation-only, not a release build.
- Browser checks: live upcoming schedule loaded 98 missions; fleet loaded eight configurations; analytics/history loaded 100 recent missions. Tested calendar switching, retry recovery, URL-backed comparison selections, mission navigation, CSV download, and NASA model loading. Provider throttling occurred during later checks; it is surfaced explicitly.
- Desktop and mobile CSS layouts inspected in the browser. Actual GPU frame pacing, battery use, TalkBack, and device WebView behavior require physical hardware.

## Native Android v1.1

The Android project is now a native Kotlin/Jetpack Compose app with Filament rendering, retaining package com.tzero.app and version 1.1.0 (code 2). The installed API 36 SDK is configured locally; JDK 17 builds the native project. No Capacitor runtime or web backend is required. See android/README.md for build and release details. Physical-device performance, battery use, and TalkBack remain hardware validation work.

The v1.1 debug APK builds successfully. Five JVM unit tests and all three Android device tests pass using the host GPU: navigation, all three heritage models, and Earth loading/orbit/reset. Earth framing was visually inspected after correcting the origin/camera target and switching to a transparent viewport. The software emulator renderer cannot compile Filament post-processing shaders; host GPU rendering works. The installable debug APK is packaged locally in releases/android; physical-device performance and accessibility validation remain before release.

## Local development

Run `npm install`, `npm run dev`, then open the printed local URL.

Checks: `npm test`, `npx tsc --noEmit`, `npm run build`.

Native Android check: `npm run check:android`.

Native Android test APK: `npm run build:android`. Do not run Capacitor sync against the native project.

## Asset provenance

See `public/models/ATTRIBUTION.md`. NASA models are preserved as source geometry and fitted to the viewer; they are visual references, not engineering drawings. The third-party Draco decoder and its Apache license are bundled locally. Decorative Earth rings do not imply live orbital telemetry.

## Scope

This work remains in the local checkout. No remote Git changes or publication have been performed. Modern commercial rockets use photos/specifications; the three downloadable 3D models are an explicitly labeled NASA heritage collection.
