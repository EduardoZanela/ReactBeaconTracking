import BeaconService from './../services/BeaconService';

const beaconService = new BeaconService();
/**
 * Funtion to save beacons, called by a Native Module
 * @param {Object[]} data List of detected beacons
 */
const saveData = async (data) => {
    console.log('BeaconListner.startRangingBeacons - ' + new Date() + ' beaconsDidRange data returned ', JSON.stringify(data));
    // CALL ASYNC FUNCTION SAVEDATA TO SAVE BEACONS TO REALM
    if(data.beacons.length > 0 ){
        beaconService.saveData(data);
    }
}

export default saveData;