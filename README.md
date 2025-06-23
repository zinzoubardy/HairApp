# HairNature AI - Natural Hair Health & Coloring Guide

## Vision
HairNature AI aims to empower users to understand and care for their natural hair by providing personalized guidance and AI-driven analysis. Our application simplifies natural haircare, promotes healthy hair practices, and helps users achieve their hair goals using natural methods.

## Core Features

### Current Status & Capabilities
The application is currently in an active development phase. The core infrastructure allows:
*   **User Authentication:** Secure sign-up, sign-in, and sign-out functionality using Supabase.
*   **Basic Navigation:** A structured navigation flow for authenticated users.
*   **AI Hair Advisor (Text-based):** Users can interact with an AI for text-based hair advice via the `HairAIScreen`. This now uses **Together AI (Llama 3.3 model)** for more advanced responses.
feat/ai-analysis-profile-updates
**Note:** The AI advisor is designed to provide hair advice based on user profile details and may not respond to unrelated requests.

**Important Note on AI Scope:** The AI advisor is designed to provide guidance *only* on hair-related topics and should base its advice *solely* on the user's provided profile details (once fully implemented). It should not respond to requests outside of this scope.

*   **Profile Management:** Users can view and update basic profile information on `ProfileScreen`.
*   **Image Upload Foundation:** The `UploadScreen` allows users to select images from their device (cloud upload and analysis are pending).
*   **Theming:** A new **futuristic and colorful dark theme** has been applied to key screens (`HomeScreen`, `HairAIScreen`) using Styled Components.
*   **Runnable Application:** The app successfully launches, and the foundation for adding features is now stable. General build stabilization and dependency management have been addressed.

### Planned for MVP
The following features are targeted for the Minimum Viable Product:
*   **AI-Powered Hair Analysis (Image-based):**
    *   Implement image upload from the app to secure Supabase Storage.
    *   Develop or integrate an AI service/Supabase Edge Function capable of processing uploaded images.
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
*   **Styling:** Styled Components (v6)
*   **Navigation:** React Navigation (likely v6, based on project history)
*   **State Management:** React Context API (e.g., `AuthContext`)
*   **Backend:** Supabase (Authentication, PostgreSQL Database, Storage, Edge Functions)
*   **AI/ML:**
    *   Current: Text-based advice via **Together AI (Llama 3.3 model)** directly integrated in `src/services/AIService.js`.
    *   Planned for Image Analysis MVP: Strategy TBD.
*   **Package Manager:** npm (due to recent lock file cleanup, though yarn was previously used)
*   **Language:** TypeScript and JavaScript

## Current MVP Progress (As of Recent Updates)
*   **Application Stability:** Major runtime, bundler, and dependency issues have been addressed. The application now reliably starts and displays the initial authentication screen.
*   **Styling and Theming:** A new futuristic dark theme has been implemented using **Styled Components** and applied to `HomeScreen` and `HairAIScreen`. The `src/styles/theme.js` file defines the core color palette and fonts.
*   **AI Integration:** Direct integration with **Together AI** for advanced text-based hair advice is implemented in `src/services/AIService.js`.
*   **Backend Foundation (from original `HairApp`):**
    *   Supabase tables (`profiles`, `hair_analysis_results`, `routines`) and Row Level Security policies are defined. Schemas for `coloring_recipes` and `progress_log` have been documented (`supabase_table_schemas.md`) and initial setup SQL scripts are available in the `sql/` directory (see "Database Setup Scripts" section below).
    *   Trigger for automatic user profile creation on sign-up.
*   **Frontend Foundation (from original `HairApp` `src` folder, with updates):**
    *   Core `AuthContext` for managing user sessions.
    *   Functional UI components for `AuthScreen`, `HomeScreen`, `UploadScreen` (image selection part), `HairAIScreen` (text AI interaction with Together AI), `ProfileScreen`.
    *   Defined `AppNavigator` for screen navigation post-login.
    *   Service modules (`SupabaseService.js` for auth/profile, `AIService.js` for Together AI).

## Remaining To-Do for MVP

### Backend Development:
1.  **Database Tables (Actual Creation in Supabase):**
    *   Create `coloring_recipes` table.
    *   Create `progress_log` table.
    *   Populate `coloring_recipes` with initial data.
2.  **Storage:**
    *   Implement and test Supabase Storage bucket security policies.
3.  **Service Functions (`SupabaseService.js`):**
    *   Implement image upload to Supabase Storage.
    *   Implement CRUD functions for `routines`.
    *   Implement function to save data to `hair_analysis_results`.
    *   Implement function to fetch `coloring_recipes`.
    *   Implement CRUD functions for `progress_log`.

### Frontend Development:
1.  **Screen Implementation & Theming:**
    *   `AnalysisResultScreen.js`: Develop UI, integrate image display and AI results. Apply new theme.
    *   `RoutineScreen.js`: Implement full CRUD functionality. Apply new theme.
    *   `ColoringAssistantScreen.js`: Develop to display recipes. Apply new theme.
    *   `ProgressTrackerScreen.js`: Implement logging and display. Apply new theme.
    *   `UploadScreen.js`, `AuthScreen.js`, `ProfileScreen.js`: Ensure consistent application of the new theme.
2.  **Integrate Image Upload:** Update `UploadScreen.js` to use `SupabaseService.js` for uploading and navigate to `AnalysisResultScreen.js`.

### AI Integration for Image Analysis (MVP):
*   Define and implement the image-based analysis mechanism.
*   Update `AIService.js` or create new services as needed.

### Thorough Testing:
*   Conduct end-to-end testing of all features and user flows.

## How to Run This Project

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/zinzoubardy/HairApp.git
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd HairApp
    ```
3.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```
    (Project has recently shifted to npm due to lock file consolidation).
4.  **Environment Variables:**
    *   **Supabase Configuration:**
        *   Your Supabase project URL and Anon key need to be configured. This is typically done in `src/services/SupabaseService.js`.
        *   Example structure within `SupabaseService.js`:
          ```javascript
          // Example: src/services/SupabaseService.js
          import AsyncStorage from '@react-native-async-storage/async-storage';
          import { createClient } from '@supabase/supabase-js';

          const supabaseUrl = "YOUR_SUPABASE_URL"; // Replace with your actual Supabase URL
          const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"; // Replace with your actual Supabase Anon Key

          export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
              storage: AsyncStorage,
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: false,
            },
          });
          ```
        *   For production, it's highly recommended to use environment variables (e.g., via `expo-constants` and `.env` files).
    *   **Together AI API Key:**
        *   A Together AI API key is required for the AI Hair Advisor feature.
        *   You **MUST** create the file `src/config/apiKeys.js`. This file is included in `.gitignore` and will not be committed to the repository.
        *   Structure for `src/config/apiKeys.js`:
          ```javascript
          // src/config/apiKeys.js
          // This file MUST be created by you and IS gitignored.
          export const TOGETHER_AI_API_KEY = "YOUR_TOGETHER_AI_KEY_HERE";
          ```
5.  **Start the application:**
    ```bash
    npx expo start
    ```
    Follow the prompts to open on a device/emulator.

## Database Setup Scripts
The `sql/` directory contains scripts to help set up necessary database tables, Row Level Security (RLS) policies, and storage policies if you have an existing Supabase project or are setting one up manually. These scripts are designed to be idempotent where possible (i.e., safe to run multiple times).

*   `sql/01_create_coloring_recipes.sql`: Sets up the `coloring_recipes` table, enables RLS, defines a public read policy, and an auto-update trigger for the `updated_at` column. It's adjusted to work with the existing table structure if provided.
*   `sql/02_create_progress_log.sql`: Sets up the `progress_log` table, enables RLS, defines CRUD policies for users on their own logs, and an `updated_at` trigger. It's adjusted for existing table structures.
*   `sql/03_storage_hair_images_policies.sql`: Defines RLS policies for a Supabase Storage bucket named `user.hair.images`. These policies control who can list, view, upload, update, and delete files, generally scoping access to the authenticated user for their own files/folders.

**Important:**
*   Always review SQL scripts before running them on your database.
*   For storage policies (`03_storage_hair_images_policies.sql`), ensure the bucket (`user.hair.images`) exists in your Supabase project. Creating policies via the Supabase Dashboard UI is often a good alternative or primary method for storage RLS. If running the SQL directly for storage policies fails due to permissions (e.g., "must be owner of relation objects"), using the Supabase UI is recommended.
*   These scripts assume standard Supabase setup and `auth.uid()` for user identification.
```
