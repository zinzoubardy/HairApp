import { registerRootComponent } from 'expo';
import App from './src/App';
// import 'react-native-url-polyfill/auto'; // Temporarily commented out for debugging Platform error
import 'react-native-gesture-handler';
registerRootComponent(App);