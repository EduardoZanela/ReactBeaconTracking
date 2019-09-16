import BeaconService from './../services/BeaconService';

const beaconService = new BeaconService();

const saveData = async (data) => {
    console.log('BeaconListner.startRangingBeacons - ' + new Date() + ' beaconsDidRange data returned ', data);
    // CALL ASYNC FUNCTION SAVEDATA TO SAVE BEACONS TO REALM
    beaconService.saveData(data);
}

export default saveData;