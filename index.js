/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from './App';
import syncApi from './src/headlesstask/SyncronizeApi';
import saveData from './src/headlesstask/SaveBeaconData';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('TASK_SYNC_ADAPTER', () => syncApi);
AppRegistry.registerHeadlessTask('SAVE_LOCATION', () => saveData);
