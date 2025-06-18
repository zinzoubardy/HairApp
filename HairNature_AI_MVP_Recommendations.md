# HairNature AI: MVP Development Recommendations

This document outlines key recommendations to guide the HairNature AI application towards a functional Minimum Viable Product (MVP). It prioritizes critical fixes, addresses major feature gaps, suggests a logical development order, and distinguishes essential MVP features from those that can be deferred.

## I. Immediate Critical Fixes (Blockers)

These issues currently prevent basic application functionality and user interaction. They must be addressed first.

1.  **Fix `src/App.tsx` (Highest Priority):**
    *   **Issue:** The main application entry point (`src/App.tsx`) is a placeholder and does not initialize navigation or context providers.
    *   **Action:** Re-implement `App.tsx` to:
        *   Wrap the application in `<NavigationContainer>` from `@react-navigation/native`.
        *   Wrap navigators/screens with the `<AuthProvider>` from `src/contexts/AuthContext.js`.
        *   Implement conditional logic to display `AuthScreen` (if not authenticated) or the main `AppNavigator` (if authenticated) based on `useAuth()` state.
    *   **Impact:** Enables user authentication, navigation, and makes the rest of the app usable.

2.  **Implement Supabase Storage Setup for Images:**
    *   **Issue:** Image uploads require a configured Supabase Storage bucket and policies.
    *   **Action:**
        *   Manually create a Supabase Storage bucket (e.g., "hair_images") via the Supabase dashboard.
        *   Apply appropriate storage policies (as commented in `supabase_setup.sql`) to allow authenticated users to upload and read their own images.
    *   **Impact:** Prepares the backend for image uploads, a prerequisite for image-based AI analysis.

## II. Essential MVP Feature Development (Addressing Gaps)

Once blockers are resolved, focus on implementing the core MVP features by addressing identified gaps.

### A. Core Authentication and App Structure
*   *(Covered by fixing `App.tsx`)*

### B. AI Hair Analysis (Image-based)

This is a central feature requiring significant work on the image pipeline.

1.  **Implement Image Upload Functionality:**
    *   **Issue:** `UploadScreen.js` captures local image URIs but doesn't upload them. `SupabaseService.js` lacks an upload function.
    *   **Action:**
        *   In `SupabaseService.js`, create a function `uploadHairImage(localUri, userId)` that takes a local file URI and user ID, uploads the image to the designated Supabase Storage bucket (e.g., `hair_images/{userId}/{imageName}`), and returns the public URL or storage path.
        *   Modify `UploadScreen.js` to call this new service function after image selection.
        *   Store the returned image URL (from Supabase Storage) in a state variable.
2.  **Develop `AnalysisResultScreen.js` (Initial Version):**
    *   **Issue:** Likely a placeholder screen.
    *   **Action:**
        *   The screen should receive the Supabase image URL (from `UploadScreen.js` after successful upload).
        *   For MVP, if image-based AI is complex to integrate immediately:
            *   **Option 1 (Simpler MVP):** Display the uploaded image. Allow the user to manually input observations or link to the existing text-based `HairAIScreen` for general advice *about* their hair type (which they might self-assess initially).
            *   **Option 2 (Closer to Vision, More Complex):** If an image analysis AI model is available (even if separate from the current text-based Together AI):
                *   Modify/create a Supabase Function (e.g., `analyze-hair-image`) that can take an image URL, send it to an image analysis AI service, and return structured JSON data.
                *   Update `AIService.js` with a function to call this new Supabase Function.
                *   `AnalysisResultScreen.js` calls this service, displays the image, and the structured AI results.
3.  **Store Analysis Data & Image Reference:**
    *   **Issue:** No service functions to save analysis results.
    *   **Action:**
        *   In `SupabaseService.js`, create `saveAnalysisResult(userId, imageUrl, analysisDataJson, notes)` to insert a record into `hair_analysis_results`.
        *   `AnalysisResultScreen.js` (or the screen coordinating the AI call) should use this function to save the Supabase image URL and the AI's findings (even if text-based for a simpler MVP).

### C. Natural Haircare Guidance (Routines)

1.  **Implement Routine Service Functions:**
    *   **Issue:** `SupabaseService.js` lacks CRUD functions for routines.
    *   **Action:** Add functions to `SupabaseService.js` for:
        *   `getRoutines(userId)`
        *   `createRoutine(userId, routineData)`
        *   `updateRoutine(routineId, routineData)`
        *   `deleteRoutine(routineId)`
2.  **Develop `RoutineScreen.js` (Basic CRUD):**
    *   **Issue:** Likely a placeholder.
    *   **Action:** Implement basic functionality to:
        *   List routines fetched via `getRoutines`.
        *   Allow creation of new routines (with title, description, steps as JSON).
        *   Allow viewing and editing existing routines.
        *   Allow deleting routines.

### D. Natural Hair Coloring Recipes (Basic Library)

1.  **Create `coloring_recipes` Table in Supabase:**
    *   **Issue:** Table missing from `supabase_setup.sql`.
    *   **Action:** Define and create the `coloring_recipes` table (e.g., `id`, `name`, `description`, `ingredients` (JSONB/text[]), `instructions`, `image_url` (optional)). Set RLS for public read and admin write.
    *   Manually populate with a few initial recipes for MVP testing.
2.  **Develop `ColoringAssistantScreen.js` (Read-Only):**
    *   **Issue:** Likely a placeholder.
    *   **Action:** Implement a screen that:
        *   Fetches and displays the list of coloring recipes from the new table (via a new function in `SupabaseService.js` like `getColoringRecipes()`).
        *   Allows users to view individual recipe details.
    *   **Note:** AI color prediction is a post-MVP feature.

### E. Progress Tracking (Basic)

1.  **Create `progress_log` Table in Supabase:**
    *   **Issue:** Table missing from `supabase_setup.sql`.
    *   **Action:** Define and create `progress_log` table (e.g., `id`, `user_id`, `entry_date`, `notes`, `photo_url` (optional), `activity_type`). Set RLS for user-only C.R.U.D.
2.  **Develop `ProgressTrackerScreen.js` (Basic Logging):**
    *   **Issue:** Likely a placeholder.
    *   **Action:** Implement basic functionality to:
        *   Allow users to create simple log entries (text notes, date).
        *   Display a list of their past log entries.
    *   **Note:** Photo uploads for progress logs can be a fast-follow post-MVP if image upload for analysis is prioritized first.

## III. Suggested Order of Operations

1.  **Phase 1: Foundation & Core Auth (1-2 weeks)**
    *   Fix `App.tsx`. (Critical Blocker)
    *   Setup Supabase Storage bucket and policies. (Critical Blocker)
    *   Implement `ProfileScreen` data persistence (already mostly done via `SupabaseService.js`). Test user sign-up, login, profile creation/update.
2.  **Phase 2: Text-Based AI & Basic Routines (2-3 weeks)**
    *   Ensure `HairAIScreen.js` and `AIService.js` for text-based AI are fully functional and tested.
    *   Implement `SupabaseService.js` functions for `routines` table.
    *   Develop `RoutineScreen.js` with basic CRUD for routines.
3.  **Phase 3: Image Handling & Analysis (MVP Version) (3-4 weeks)**
    *   Implement image upload in `SupabaseService.js` and `UploadScreen.js`.
    *   Develop `AnalysisResultScreen.js` (MVP version, decide on Option 1 or 2 from II.B.2).
    *   Implement `saveAnalysisResult` in `SupabaseService.js` and integrate into `AnalysisResultScreen.js`.
4.  **Phase 4: Supporting Features (MVP Versions) (2-3 weeks)**
    *   Create `coloring_recipes` table and populate. Implement read-only `ColoringAssistantScreen.js` and associated service function.
    *   Create `progress_log` table. Implement basic `ProgressTrackerScreen.js` (text logging) and associated service functions.
5.  **Phase 5: Testing & Refinement (1-2 weeks)**
    *   End-to-end testing of all MVP features.
    *   Bug fixing and UI/UX polishing.

*(Timelines are rough estimates and depend on developer resources and experience.)*

## IV. Post-MVP Considerations

The following features, while valuable, can be deferred to after the initial MVP launch to manage scope:

*   **Advanced AI Image Analysis:** Complex AI models, detailed JSONB output for specific hair characteristics (porosity, density if not in MVP1).
*   **AI-Powered Color Outcome Predictions:** For the coloring assistant.
*   **Extensive Educational Resources:** Building a large library of articles/tutorials.
*   **Community Features:** If planned (e.g., sharing routines, forums).
*   **Advanced Progress Tracking:** Detailed charts, photo comparison tools.
*   **Product Recommendation Engine:** Suggesting specific commercial products.
*   **Push Notifications & Reminders.**
*   **Offline Support (beyond Supabase cache).**

By following these recommendations, HairNature AI can achieve a functional MVP that delivers on its core promise of providing AI-driven hair analysis and personalized guidance.## V. Summary Table: MVP Feature Checklist

| Feature Area                     | MVP Must-Have                                                                 | Implementation Notes                                                                                                                               | Status (From Assessments)                     |
|----------------------------------|-------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| **Core App Structure**           | Functional `App.tsx` with Auth & Navigation                                   | Fix placeholder, integrate `AuthProvider`, conditional nav.                                                                                          | **CRITICAL BLOCKER**                          |
| **Authentication**               | User Sign-up, Sign-in, Sign-out, Profile Creation                             | `AuthScreen`, `AuthContext`, `SupabaseService` mostly ready. `handle_new_user` trigger is good.                                                   | Blocked by `App.tsx`                          |
| **User Profile Management**      | View & Edit basic profile (name, hair goal, allergies)                       | `ProfileScreen` & `SupabaseService` profile functions are good.                                                                                    | Good (once auth works)                        |
| **AI Hair Analysis (Image)**     | Upload image, store URL, (Text-based analysis initially if image AI is complex) | **Image Upload:** Implement in `UploadScreen` & `SupabaseService`. **Storage:** Setup bucket. **AI:** Text AI for now via `HairAIScreen` is an option. | **CRITICAL GAPS** (Upload, Image AI)        |
|                                  | Save analysis (image URL & AI text) to `hair_analysis_results`                | `SupabaseService` function needed. `AnalysisResultScreen` to coordinate.                                                                           | **GAP**                                       |
| **Natural Haircare (Routines)**  | View, Create, Edit, Delete routines                                           | `RoutineScreen` needs full implementation. `SupabaseService` needs CRUD functions for `routines`.                                                  | **GAP** (Screen & Service functions)          |
| **Coloring Recipes (Library)**   | View list & details of predefined natural coloring recipes                    | Create `coloring_recipes` table (admin-populated). `ColoringAssistantScreen` (read-only). `SupabaseService` func to fetch.                         | **GAP** (Table, Screen, Service function)     |
| **Progress Tracking (Basic)**    | Log text entries with dates, view log history                                 | Create `progress_log` table. `ProgressTrackerScreen` (basic text log). `SupabaseService` funcs for basic C.R.U.D.                               | **GAP** (Table, Screen, Service functions)    |

This checklist summarizes the essential components required for the HairNature AI MVP.
```
