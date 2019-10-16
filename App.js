import React, {Component} from 'react';
import {
  StyleSheet,
  NativeModules,
  StatusBar,
  PermissionsAndroid,
  AppRegistry,
} from 'react-native';
import SyncAdapter from 'react-native-sync-adapter';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import RealmRepository from './src/models/RealmRepository';
import Resources from './src/constants/Constants';
import syncApi from './src/headlesstask/SyncronizeApi';
import saveData from './src/headlesstask/SaveBeaconData';
import HomeScreen from './src/components/HomeScreen';
import Register from './src/components/Register';
import Location from './src/components/Locations';

AppRegistry.registerHeadlessTask('TASK_SYNC_ADAPTER', () => syncApi);
AppRegistry.registerHeadlessTask('SAVE_LOCATION', () => saveData);

const beaconManager = NativeModules.BeaconModule; 
const syncInterval = Resources.SYNC_INTERVAL_IN_SECONDS;
const syncFlexTime = Resources.SYNC_FLEX_TIME;

class Initial extends Component {

  constructor(props){
    super(props)
    this.state = {
        loggedIn: false,
        finishDatabase: false
    };
    this.isLoggedIn();
  }

  isLoggedIn(){
    RealmRepository.dbOperation((repository) => {
        let users = repository.objects('User');
        /*repository.write(() => {
            repository.delete(users);
          });      */  
        this.setState({
            finishDatabase: true
        });
        if (repository.objects('User')[0]){
            console.log('User: ' + JSON.stringify(repository.objects('User')[0]));
            this.setState({
                loggedIn: true
            });
        }
    });
  }

  render() {
    console.log('APP.render - state positions ' + this.state.positions);
    return (
      <React.Fragment>
        <StatusBar translucent backgroundColor='transparent' barStyle='dark-content'/>
        {this.state.loggedIn && <HomeScreen navigation={this.props.navigation}/>}
        {!this.state.loggedIn && <Register navigation={this.props.navigation}/>}
      </React.Fragment>
    );
  }
}

const RootStack = createStackNavigator(
  {
    Register: {
      screen: Register,
      navigationOptions: {
         header: null,
      }
    },
    Home: {
      screen: Initial,
      navigationOptions: {
        header: null,
      }
    },
    Location: {
      screen: Location,
      navigationOptions: {
         header: null,
       }
    }
  },
  {
    initialRouteName: 'Home',
  },
  {headerMode: 'screen'}
);

const AppContainer = createAppContainer(RootStack);

export default class App extends Component {

  constructor(props){
    super(props);

    SyncAdapter.init({
      syncInterval,
      syncFlexTime,
    });

    // Request permission to access coase location, to be able to scan for beacons
    this.requestLocationAccessPermission();

    // Start ranging for beacons
    beaconManager.startRanging(() => console.log('connected'), () => console.log('rejected'));
    //beaconManager.setForegroundBetweenScanPeriod(Resources.ONE_MINUTE_IN_MILLI_SECONDS*2);
  }

  async requestLocationAccessPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Permissão de localização',
          message: 'O aplicativo necessita utilizar sua localização',
          buttonNegative: 'Cancelar',
          buttonPositive: 'Permitir',
        },
      );
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    return <AppContainer />;
  }

}