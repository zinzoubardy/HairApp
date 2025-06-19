# HairNature AI: First Run Test Instructions (After `App.tsx` Update)

These instructions will guide you through testing the HairNature AI application after the critical `src/App.tsx` file has been updated. The goal is to ensure the app loads correctly, handles initial authentication state, and navigates to the appropriate screen.

## Prerequisites:

*   Node.js and npm/yarn installed on your system.
*   Expo CLI installed globally: `npm install -g expo-cli` (or `yarn global add expo-cli`).
*   An Android emulator/simulator, iOS simulator set up on your machine, OR the Expo Go app installed on a physical Android/iOS device.
*   The application code downloaded to your local machine.
*   Ensure you are in the root directory of the project in your terminal.

## Step 1: Ensure All Dependencies Are Installed

Before running the application, make sure all necessary Node.js packages are installed.

1.  Open your terminal or command prompt.
2.  Navigate to the root directory of the HairNature AI project (where `package.json` is located).
3.  Run the following command:

    ```bash
    npm install
    ```
    or if you are using Yarn:
    ```bash
    yarn install
    ```
    This command will read the `package.json` file and install all the dependencies listed, including React Native, Expo, navigation libraries, Supabase client, etc.

## Step 2: Start the Expo Development Server

Once dependencies are installed, you can start the Expo development server.

1.  In the same terminal (at the project root), run:

    ```bash
    npm start
    ```
    or
    ```bash
    expo start
    ```
    or if you are using Yarn:
    ```bash
    yarn start
    ```
2.  This will start the Metro Bundler and open a new tab in your web browser with the Expo Developer Tools. You will also see a QR code in the terminal output and in the browser.

## Step 3: Run the Application

You have several options to run the application:

### A. On an Android Emulator/Connected Device:

1.  Ensure your Android emulator is running or a physical Android device is connected to your computer with USB debugging enabled.
2.  In the Expo Developer Tools web page (opened in Step 2), you should see an option like "Run on Android device/emulator." Click it.
3.  Alternatively, from the terminal where `expo start` is running, press `a`.
4.  The Expo Go app will be automatically installed on the emulator/device if it's not already there, and then the HairNature AI app bundle will be built and loaded.

### B. On an iOS Simulator (macOS only):

1.  Ensure Xcode is installed and an iOS simulator is running.
2.  In the Expo Developer Tools web page, click "Run on iOS simulator."
3.  Alternatively, from the terminal where `expo start` is running, press `i`.
4.  The Expo Go app will be installed on the simulator if needed, and then the app will load.

### C. On a Physical Device using Expo Go:

1.  Install the "Expo Go" app from the Google Play Store (Android) or Apple App Store (iOS) on your physical device.
2.  Ensure your physical device is connected to the **same Wi-Fi network** as your computer.
3.  Open the Expo Go app on your device.
4.  Scan the QR code displayed in the terminal or in the Expo Developer Tools web page using the Expo Go app.
5.  The app bundle will be downloaded and run on your device.

## Step 4: What to Look For to Confirm Success

As the application loads and starts, observe the following to confirm that the `App.tsx` update is working correctly:

1.  **No Crashes:** The application should load without immediately crashing. If it crashes, there might be an issue with imports, dependencies, or basic syntax in `App.tsx` or related files. Check the terminal for error messages.

2.  **Initial Loading Indicator:**
    *   You should briefly see a loading indicator (an `ActivityIndicator`). This is because `App.tsx` now has a `loadingInitial` state in `AuthContext` which is true while Supabase checks for an existing session.
    *   This indicator might be visible for a very short period, especially if the session check is fast.

3.  **Navigation to the Correct Screen:**

    *   **If NOT Authenticated (Most likely for a first run or after sign-out):**
        *   The application should display the **`AuthScreen`**. This screen typically contains "Sign In" and "Sign Up" options, with input fields for email and password.
        *   This indicates that `user` is `null` after the initial auth check, and the conditional rendering in `App.tsx` has correctly navigated to `AuthScreen`.

    *   **If ALREADY Authenticated (e.g., if you signed in during a previous session and Supabase remembers it):**
        *   The application should bypass `AuthScreen` and directly display the **`HomeScreen`** (or whatever the initial route of your `AppNavigator` is configured to be – `HomeScreen` is the default in the current `AppNavigator.js`).
        *   You might see the welcome message on `HomeScreen` or any content you've placed there.
        *   This indicates that `user` object was found (session restored), and `App.tsx` correctly navigated to the main app stack (`AppNavigator`).

## Troubleshooting:

*   **Errors in Terminal:** Pay close attention to any error messages printed in the terminal where `expo start` is running. These often provide clues about what went wrong (e.g., module not found, syntax errors).
*   **Device/Emulator Logs:** You can access more detailed logs from the device/emulator if needed (e.g., using Android Studio's Logcat or Xcode's Console).
*   **Ensure Supabase is Running (if self-hosting):** If you are self-hosting Supabase, ensure your Supabase instance is running and accessible. For Supabase Cloud, this is generally not an issue unless there's a service outage.
*   **Check `SupabaseService.js` Configuration:** Ensure the Supabase URL and Anon Key in `src/services/SupabaseService.js` are correct for your Supabase project. Incorrect keys will prevent authentication.

If you see the loading indicator followed by either the `AuthScreen` (for unauthenticated users) or `HomeScreen` (for authenticated users), then the `App.tsx` update and initial setup are likely working correctly! You can then proceed to test the authentication flow (signing up, signing in, signing out).
```
