# T-Zero: Space Mission Dashboard

<p align="center">
  <img src="logo.png" alt="T-Zero Logo" width="150" height="150" />
</p>

**The New Era of Space Exploration**

Your unified command center for the modern space race. Track real-time missions, analyze launch data, and witness humanity's journey to the stars.

T-Zero is a unified, real-time space mission dashboard that aggregates data from different space agencies into one accessible platform.

## Features

- **Launch Center**: Real-time countdowns and upcoming mission tracking.
- **Fleet Explorer**: Interactive comparison of rockets from SpaceX, NASA, and ISRO.
- **Mission Timeline**: Historical view of humanity's space journey.
- **Analytics Hub**: Comparative analytics and success metrics.
- **Mobile App**: Android APK support via Capacitor.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Mobile**: Capacitor (Android)

## Getting Started

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Android

The Android application is a "Hybrid App". It runs the frontend locally on the device (via Capacitor) but fetches data from your deployed Next.js API.

### Prerequisites
- Android Studio
- JDK 21+ installed
- A deployed version of this repo (e.g., on Vercel) to serve the API.

### Build Steps

1.  **Deploy Backend**:
    Push this repository to GitHub and deploy to Vercel. This ensures the API endpoints (`/api/...`) are live and accessible over the internet.
    *Note: The project includes CORS configuration in `next.config.ts` to allow the Android app to talk to Vercel.*

2.  **Generate Mobile Assets (Icons/Splash)**:
    If you change `assets/logo.png`, regenerate the icons:
    ```bash
    npx @capacitor/assets generate --iconBackgroundColor '#020617' --splashBackgroundColor '#020617' --android
    ```

3.  **Build Static Frontend**:
    Run the build with the Android target flag. Replace `NEXT_PUBLIC_API_URL` with your **actual Vercel Deployment URL**.
    ```bash
    # Windows (PowerShell)
    $env:NEXT_PUBLIC_API_URL='https://your-project.vercel.app'; $env:BUILD_TARGET='android'; npm run build
    
    # Mac/Linux
    NEXT_PUBLIC_API_URL='https://your-project.vercel.app' BUILD_TARGET=android npm run build
    ```
    *Note: `next build` might warn about headers being ignored for static export. This is expected—the headers are for the Vercel deployment, not the static Android files.*

4.  **Sync Capacitor**:
    Copy the build assets to the Android project.
    ```bash
    npx cap sync
    ```

5.  **Compile APK**:
    Open the `android` folder in **Android Studio** and click **Run** or **Build > Build Bundle(s) / APK(s)**.

## Project Structure

- `src/app`: Page routes and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions and API SDK.
- `android`: Native Android project files.
- `assets`: Source files for app icons and splash screens.


- 3D visualizations of rockets.

---

*"Ensuring peace and sustainability in the final frontier."*

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
