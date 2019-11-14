import React, {Component} from 'react';
import {
  StyleSheet,
  NativeModules,
  StatusBar,
  PermissionsAndroid
} from 'react-native';
import SyncAdapter from 'react-native-sync-adapter';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import RealmRepository from './src/models/RealmRepository';
import Resources from './src/constants/Constants';
import HomeScreen from './src/components/HomeScreen';
import Register from './src/components/Register';
import Location from './src/components/Locations';


const beaconManager = NativeModules.BeaconModule; 
const syncInterval = Resources.SYNC_INTERVAL_IN_SECONDS;
const syncFlexTime = Resources.SYNC_FLEX_TIME;

class Initial extends Component {

  constructor(props){
    super(props)
    this.state = {
        loggedIn: false,
        finishDatabase: false,
        startedbeaconScan: false
    };
    this.isLoggedIn();
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('component update');
    if (this.state.loggedIn && !this.state.startedbeaconScan) {
      this.setState({
        startedbeaconScan: true
      });
      console.log('component update inside');

      // Start ranging for beacons
      beaconManager.startRanging(() => console.log('connected'), () => console.log('rejected'));
      //beaconManager.setForegroundBetweenScanPeriod(Resources.ONE_MINUTE_IN_MILLI_SECONDS*2);

      SyncAdapter.init({
        syncInterval,
        syncFlexTime,
      });
    }
  }

  isLoggedIn(){
    RealmRepository.dbOperation((repository) => {
        let users = repository.objects('User');
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

    // Request permission to access coase location, to be able to scan for beacons
    this.requestLocationAccessPermission();
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
      const grantedWriteExternal = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permissão para gravar arquivos',
          message: 'O aplicativo necessita gravar relatorios externamente',
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