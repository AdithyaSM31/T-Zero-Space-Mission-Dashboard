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

## Remaining environment-dependent validation

The machine has JDK 17 and no detected Android SDK. Building an APK requires JDK 21 and Android SDK API 36 for this Capacitor 8 project. A release static frontend also needs the actual deployed HTTPS API origin. No APK, physical-device performance result, or screen-reader certification is claimed.

## Local development

Run `npm install`, `npm run dev`, then open the printed local URL.

Checks: `npm test`, `npx tsc --noEmit`, `npm run build`.

Android export check: `npm run check:android`.

Android release frontend: set `NEXT_PUBLIC_API_URL` to the deployed HTTPS API origin, run `npm run build:android`, then `npx cap sync android`.

## Asset provenance

See `public/models/ATTRIBUTION.md`. NASA models are preserved as source geometry and fitted to the viewer; they are visual references, not engineering drawings. The third-party Draco decoder and its Apache license are bundled locally. Decorative Earth rings do not imply live orbital telemetry.

## Scope

This work remains in the local checkout. No remote Git changes or publication have been performed. Modern commercial rockets use photos/specifications; the three downloadable 3D models are an explicitly labeled NASA heritage collection.
