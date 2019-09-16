import {NativeModules} from 'react-native';
import Resources from './../constants/Constants';

const beaconManager = NativeModules.BeaconModule;

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
  }
}