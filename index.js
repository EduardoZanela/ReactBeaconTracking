/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import syncApi from './src/scheduler/SyncronizeApi';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask('TASK_SYNC_ADAPTER', () => syncApi);