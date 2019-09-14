import {DeviceEventEmitter, NativeModules} from 'react-native';
import BeaconService from './BeaconService';
import Resources from './../constants/Constants';

const beaconManager = NativeModules.BeaconModule;
const beaconService = new BeaconService();

export default class BeaconListner {
    /**
   * Default function of react native, called every time component needs to be mounted
   */
  static startRangingBeacons() {
    // STARTS SCAN
    beaconManager.startRanging(() => console.log('connected'), () => console.log('rejected'));
    
    // SET TIME BETWEEN SCANS
    beaconManager.setForegroundBetweenScanPeriod(Resources.ONE_MINUTE_IN_MILLI_SECONDS*3);
    beaconManager.setBackgroundBetweenScanPeriod(Resources.ONE_MINUTE_IN_MILLI_SECONDS*5);

    // LISTNER TO RECEIVE DATA FROM BEACONS SCAN
    DeviceEventEmitter.addListener('beaconsDidRange',
      (data) => {
        console.log('BeaconListner.startRangingBeacons - ' + new Date() + ' beaconsDidRange data returned ', data);
        // CALL ASYNC FUNCTION SAVEDATA TO SAVE BEACONS TO REALM
        beaconService.saveData(data);
      }
    );
  }
}