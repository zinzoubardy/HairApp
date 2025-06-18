import { registerRootComponent } from 'expo';
import App from './src/App'; // Ensure this path is correct

// Polyfills that were previously commented out might still be needed.
// It's good practice to keep them if they were there for a reason.
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler'; // Must be at the top (or very early) if used

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go,
// or create a production build, the root component is setup correctly.
registerRootComponent(App);
