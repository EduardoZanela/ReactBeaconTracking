import moment from 'moment';
import timezone from 'moment-timezone'
import PubSub from 'pubsub-js'
import Realm from 'realm';

import Position from './../models/Position';
import Distance from './../models/Distance';

const repository = new Realm({
    schema: [Position.schema, Distance.schema]
});

export default class BeaconService{
    /**
   * Async function to save scanned beacons to realm database
   * @param {Object} data Beacons returned by native module 
   */
  async saveData(data){
    // CREATE ARRAY OF DISTANCES
    var distances = [];

    // CREATE BEACONS ARRAY
    data.beacons.forEach((beacon) => {
      if(beacon.uuid){
        distances.push(new Distance(beacon.uuid+';'+beacon.major+';'+beacon.minor, beacon.distance));
      } else {
        distances.push(new Distance(beacon.namespaceId+';'+beacon.instanceId, beacon.distance));
      }
    });

    // SAVE POSITION WITH DISTANCES
    let position = new Position(distances);
    repository.write(() => {
      repository.create('Position', position);
    });

    // CALL FUNCTION TO UPDATE STATE AND SHOW LAST POSITIONS
    this.findBeaconsByTime(5);
    let all = repository.objects('Position');
    console.log('from repo: ' + all.length);
  }

  /**
   * Function async to update state with last positions
   * @param {number} time Tempo em minutos para busca dos ultimos registros 
   */
  async findBeaconsByTime(time){
    console.log('enter update beacons');

    let dt = new Date();
    dt.setMinutes( dt.getMinutes() - time);
    let dtFilter = moment(dt).tz("America/Sao_Paulo").toDate();
    console.log('date to filter ' + dtFilter + ' ' + typeof(dtFilter));

    let positions = repository.objects('Position').filtered('createdDate > $0', dtFilter);
    console.log('positions db ' + JSON.stringify(positions));
    // publish a topic asynchronously
    PubSub.publish('NEW_BEACONS_ADD', positions);
  }
}