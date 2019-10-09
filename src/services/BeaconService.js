import moment from 'moment';
import timezone from 'moment-timezone'
import PubSub from 'pubsub-js'
import RealmRepository from './../models/RealmRepository';
import {AppState} from 'react-native';

import Position from './../models/Position';
import Distance from './../models/Distance';
import Resources from './../constants/Constants';


export default class BeaconService{
  
  constructor(){
    this.state = {
      appState: AppState.currentState
    }
    AppState.addEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }
    this.state.appState = nextAppState;
  }
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
    RealmRepository.dbOperation((repository) => {
      repository.write(() => {
        repository.create('Position', position);
      });
    });
    
    if(this.state.appState.match(/active/)){
      // CALL FUNCTION TO UPDATE STATE AND SHOW LAST POSITIONS
      this.findBeaconsByTime(Resources.BEACONS_TO_SHOW);
    }
  }

  /**
   * Function async to update state with last positions
   * @param {number} time Tempo em minutos para busca dos ultimos registros 
   */
  async findBeaconsByTime(number){
    console.log('BeaconService.findBeaconsByTime - enter update beacons');

    RealmRepository.dbOperation((repository) => {
      let positions = repository.objects('Position').sorted('createdDate', true).slice(0,number);
      console.log('BeaconService.findBeaconsByTime - objects filtered from repo ' + positions.length);
      // publish a topic asynchronously
      PubSub.publish('NEW_BEACONS_ADD', positions);
    });
  }
}