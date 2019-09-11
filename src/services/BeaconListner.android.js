import {DeviceEventEmitter, NativeModules} from 'react-native';
import BeaconService from './BeaconService';

const beaconManager = NativeModules.BeaconModule;
const beaconService = new BeaconService();

const ONE_MINUTE = 60000;

export default class BeaconListner {
    /**
   * Default function of react native, called every time component needs to be mounted
   */
  static startRangingBeacons() {
    // STARTS SCAN
    beaconManager.startRanging(() => console.log('connected'), () => console.log('rejected'));
    
    // SET TIME BETWEEN SCANS
    //BeaconManager.setForegroundBetweenScanPeriod(ONE_MINUTE);
    //BeaconManager.setBackgroundBetweenScanPeriod(ONE_MINUTE*5);

    // LISTNER TO RECEIVE DATA FROM BEACONS SCAN
    DeviceEventEmitter.addListener('beaconsDidRange',
      (data) => {
        console.log(new Date() + ' beaconsDidRange data: ', data);

        // CALL ASYNC FUNCTION SAVEDATA TO SAVE BEACONS TO REALM
        beaconService.saveData(data);
      }
    );
  }
}