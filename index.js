import 'react-native-url-polyfill/auto'; // Import the polyfill
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
