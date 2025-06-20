# HairNature AI - Natural Hair Health & Coloring Guide

## Vision
HairNature AI aims to empower users to understand and care for their natural hair by providing personalized guidance and AI-driven analysis. Our application simplifies natural haircare, promotes healthy hair practices, and helps users achieve their hair goals using natural methods.

## Core Features

### Current Status & Capabilities
The application is currently in an active development phase. The core infrastructure allows:
*   **User Authentication:** Secure sign-up, sign-in, and sign-out functionality using Supabase.
*   **Basic Navigation:** A structured navigation flow for authenticated users.
*   **AI Hair Advisor (Text-based):** Users can interact with an AI for text-based hair advice via the `HairAIScreen`.
*   **Profile Management:** Users can view and update basic profile information on `ProfileScreen`.
*   **Image Upload Foundation:** The `UploadScreen` allows users to select images from their device (cloud upload and analysis are pending).
*   **Runnable Application:** The app successfully launches, and the foundation for adding features is now stable. Key initial setup items like NativeWind configuration and splash screen fixes have been addressed.

### Planned for MVP
The following features are targeted for the Minimum Viable Product:
*   **AI-Powered Hair Analysis (Image-based):**
    *   Implement image upload from the app to secure Supabase Storage.
    *   Develop or integrate an AI service/Supabase Edge Function capable of processing uploaded images (strategy TBD: may involve user description paired with image, or simpler image-to-text AI for MVP).
    *   Receive basic AI-driven analysis or suggestions.
    *   View results (uploaded image and AI findings) on the `AnalysisResultScreen`.
    *   Analysis data (image reference, AI findings) saved to the user's profile via `hair_analysis_results` table.
*   **Personalized Natural Haircare Routines:**
    *   Create, view, edit, and delete personalized haircare routines on the `RoutineScreen`.
    *   Full CRUD operations interacting with the Supabase backend's `routines` table.
*   **Natural Hair Coloring Recipes:**
    *   Browse a library of predefined natural hair coloring recipes (e.g., henna, indigo) on the `ColoringAssistantScreen`.
    *   (Requires admin-populated `coloring_recipes` table in Supabase).
*   **Progress Tracking (Basic Log):**
    *   Log text-based entries about haircare activities and observations with dates on the `ProgressTrackerScreen`.
    *   (Requires `progress_log` table in Supabase).

## Tech Stack
*   **Frontend:** React Native (v0.79.4) with Expo SDK 53 (utilizing React 19.0.0)
*   **Styling:** NativeWind v4 / Tailwind CSS (setup complete), potential for some existing `styled-components` (v6) usage.
*   **Navigation:** React Navigation v6
*   **State Management:** React Context API (e.g., `AuthContext`)
*   **Backend:** Supabase (Authentication, PostgreSQL Database, Storage, Edge Functions for AI interaction)
*   **AI/ML:**
    *   Current: Text-based advice via Supabase Edge Function (`get-ai-hair-advice`) proxying to a third-party AI (e.g., Together AI).
    *   Planned for Image Analysis MVP: Strategy TBD (see "Planned for MVP" section). Consider adding explicit user authentication to Edge Functions for enhanced security and quota management.
*   **Package Manager:** Yarn (recommended for this project)
*   **Language:** TypeScript

## Current MVP Progress (As of Project Reset & Stabilization)
*   **Application Stability:** Major runtime, bundler, and dependency issues have been resolved by resetting the project structure into `HairAppFresh` using Expo SDK 53 with React 19 & React Native 0.79.4. The application now reliably starts and displays the initial authentication screen.
*   **Styling and Configuration:** NativeWind v4 has been installed and configured. The splash screen warning has been resolved.
*   **Backend Foundation (from original `HairApp`):**
    *   Supabase tables (`profiles`, `hair_analysis_results`, `routines`) and Row Level Security policies are defined. Schemas for `coloring_recipes` and `progress_log` have been documented (`supabase_table_schemas.md`).
    *   A Supabase Edge Function (`get-ai-hair-advice`) for text-based AI prompts is in place.
    *   Trigger for automatic user profile creation on sign-up.
*   **Frontend Foundation (from original `HairApp` `src` folder):**
    *   Core `AuthContext` for managing user sessions.
    *   Functional UI components for `AuthScreen`, `HomeScreen`, `UploadScreen` (image selection part), `HairAIScreen` (text AI interaction), `ProfileScreen`.
    *   Defined `AppNavigator` for screen navigation post-login.
    *   Service modules (`SupabaseService.js` for auth/profile, `AIService.js` for text AI).

## Remaining To-Do for MVP

### Backend Development:
1.  **Database Tables (Actual Creation in Supabase):**
    *   Create `coloring_recipes` table in Supabase (schema documented in `supabase_table_schemas.md`).
    *   Create `progress_log` table in Supabase (schema documented in `supabase_table_schemas.md`).
    *   Populate `coloring_recipes` with initial data for MVP.
2.  **Storage:**
    *   Implement and test Supabase Storage bucket security policies (via Supabase Dashboard) for hair images and potentially progress log images.
3.  **Service Functions (`SupabaseService.js`):**
    *   Implement image upload to Supabase Storage (e.g., `uploadHairImage(localUri, userId)`).
    *   Implement CRUD functions for the `routines` table (e.g., `getRoutines`, `createRoutine`, `updateRoutine`, `deleteRoutine`).
    *   Implement function to save data to `hair_analysis_results` (e.g., `saveAnalysisResult(userId, imageUrl, analysisDataJson, notes)`).
    *   Implement function to fetch `coloring_recipes` (e.g., `getColoringRecipes()`).
    *   Implement CRUD functions for the `progress_log` table (e.g., `getProgressLogs`, `createProgressLog`, etc.).

### Frontend Development:
1.  **Screen Implementation:**
    *   `AnalysisResultScreen.js`: Develop to:
        *   Receive image URL (after upload).
        *   Orchestrate call to AI image analysis service (once available).
        *   Display uploaded image and AI analysis.
        *   Allow saving of results.
    *   `RoutineScreen.js`: Implement full CRUD functionality for user routines, interacting with `SupabaseService.js`.
    *   `ColoringAssistantScreen.js`: Develop to display coloring recipes fetched from `SupabaseService.js` (read-only for MVP).
    *   `ProgressTrackerScreen.js`: Implement basic text logging and display capabilities, interacting with `SupabaseService.js`.
2.  **Integrate Image Upload:** Update `UploadScreen.js` to use the new `SupabaseService.js` function to upload the selected image and pass the resulting cloud URL to `AnalysisResultScreen.js`.

### AI Integration for Image Analysis (MVP):
*   Define the specific mechanism for image-based analysis for the MVP (e.g., user describes image, AI gives text advice; or a basic image-to-text model if feasible).
*   If a new/updated Supabase Edge Function is needed for image analysis, develop and deploy it.
*   Update `AIService.js` to interact with the chosen image analysis mechanism.

### Thorough Testing:
*   Conduct end-to-end testing of all features and user flows once development iterations complete.

## How to Run This Project

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/zinzoubardy/HairApp.git
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd HairApp
    ```
    (This directory is now based on the `HairAppFresh` structure).
3.  **Install dependencies:**
    It is highly recommended to use Yarn for this project:
    ```bash
    yarn install
    ```
    If you must use npm and encounter issues, you might need `npm install --legacy-peer-deps`.
4.  **Environment Variables:**
    *   Ensure your Supabase project URL and Anon key are correctly configured. This is likely done within `src/services/SupabaseService.js` or via environment variables (preferred). Create a `.env` file if needed and ensure it's gitignored.
    *   `SupabaseService.js` might look like:
        ```javascript
        // Example: src/services/SupabaseService.js
        import AsyncStorage from '@react-native-async-storage/async-storage';
        import { createClient } from '@supabase/supabase-js';

        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL; // Or your actual URL
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // Or your actual key

        export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          },
        });
        ```
5.  **Start the application:**
    ```bash
    npx expo start
    ```
    Follow the prompts to open on a device/emulator.
```
