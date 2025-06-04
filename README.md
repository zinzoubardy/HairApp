# HairNature AI - Natural Hair Health & Coloring Guide

This project is a mobile application designed to provide AI-powered natural haircare suggestions, natural coloring recipes, and progress tracking.

## Project Goals

- Analyze hair condition from a user-uploaded photo.
- Provide fully natural haircare guidance (no synthetic products).
- Suggest natural hair coloring recipes (e.g., henna, herbs).
- Allow users to track hair health progress visually and via daily routines.

## Tech Stack (Planned)

- **Frontend**: React Native + Expo
- **Styling**: Tailwind CSS (with NativeWind or similar) or styled-components
- **Backend**: Supabase (Auth, Storage, Database)
- **AI/ML**: External services for hair analysis and GPT-4 for routine/recipe generation.

## Getting Started (Conceptual)

This project is set up to use Expo.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd HairNatureAI
    ```
2.  **Install dependencies:**
    It is recommended to use `npm` or `yarn`. The `package.json` includes the necessary dependencies.
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up Supabase:**
    - Create a project on [Supabase](https://supabase.com/).
    - Obtain your Project URL and Anon Key.
    - You will need to configure these in the application, likely within `src/services/SupabaseService.js` or environment variables.

4.  **Set up AI/ML Service Keys:**
    - Obtain API keys for your chosen hair analysis model and OpenAI GPT-4.
    - Configure these within the application, likely in `src/services/AIService.js` or environment variables.

5.  **Run the application:**
    ```bash
    npm start
    # or
    yarn start
    ```
    This will start the Metro Bundler. You can then run the app on an emulator/simulator or scan the QR code with the Expo Go app on your physical device.

## Directory Structure

- `src/`: Contains the main source code.
  - `App.js` or `App.tsx`: Main application component.
  - `assets/`: Static files like images, fonts.
  - `components/`: Reusable UI components.
  - `contexts/`: React Context API providers.
  - `hooks/`: Custom React hooks.
  - `navigation/`: Navigation setup (React Navigation).
  - `screens/`: Top-level screen components.
  - `services/`: Modules for interacting with external services (Supabase, AI APIs).
  - `styles/`: Global styles, theme configuration.
  - `utils/`: Utility functions.
- `package.json`: Project metadata and dependencies.
- `app.json`: Expo configuration file.

This README provides a basic overview. More detailed documentation will be added as the project progresses.
