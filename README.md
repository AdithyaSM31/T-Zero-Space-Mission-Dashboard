# T-Zero: Space Mission Dashboard

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

To create the APK:

1.  **Configure API**:
    Updates `NEXT_PUBLIC_API_URL` to point to your live backend (or a placeholder like `https://t-zero.vercel.app`) in your environment. The Android app requires an internet-accessible API.

2.  **Build Static Frontend**:
    Run the build command with the Android target flag. This handles the static export required by Capacitor.
    ```bash
    # Windows (PowerShell)
    $env:BUILD_TARGET='android'; npm run build
    
    # Mac/Linux
    BUILD_TARGET=android npm run build
    ```
    *Note: You may need to temporarily hide `src/app/api` if build fails on API routes.*

3.  **Sync Capacitor**:
    ```bash
    npx cap sync
    ```

4.  **Compile APK**:
    Open the `android` folder in **Android Studio** and run the project.
    *Requirement: JDK 21+ is required.*

## Project Structure

- `src/app`: Page routes and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions.
- `android`: Native Android project files.

- 3D visualizations of rockets.

---

*"Ensuring peace and sustainability in the final frontier."*

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
