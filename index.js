import 'react-native-gesture-handler'; // Ensure this is the very first import
import { registerRootComponent } from 'expo';
import App from './src/App';

// import 'react-native-url-polyfill/auto'; // Temporarily commented out for debugging Platform error
registerRootComponent(App);