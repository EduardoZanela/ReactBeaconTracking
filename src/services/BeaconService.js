import moment from 'moment';
import timezone from 'moment-timezone'
import PubSub from 'pubsub-js'
import RealmRepository from './../models/RealmRepository';
import {AppState} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

import Position from './../models/Position';
import Distance from './../models/Distance';
import Resources from './../constants/Constants';
import InterSCityApi from './../api/InterSCityApi';
import Beacon from './../models/Beacon';
import Build from './../models/Build'

const api = new InterSCityApi();

/**
 * Class that concentrates the beacon operations
 */
export default class BeaconService{
  
  /**
   * Constructor of Beacon Service
   * @constructor
   */
  constructor(){
    this.state = {
      appState: AppState.currentState
    }
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  /**
   *  Function to update the state prop wiht application's state
   *  @param {string} nextAppState The next state
   */
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
      
      let minDistanceBeacon = position.distances.reduce((prev, current) => { 
        return (prev.distance < current.distance) ? prev : current 
      });
      let uuids = position.distances.map(distance => distance.uuid);
      let query = uuids.map((uuid) => "uuid == '" + uuid + "'").join(' OR ');
      let beacons = repository.objects('Beacon');
      let filteredBeacons = beacons.filtered(query);

      if(filteredBeacons.length != uuids.length){
        let mapDbUuid = filteredBeacons.map(b => b.uuid);
        let difference = uuids.filter(x => !mapDbUuid.includes(x));
        let filterApi = {
          'capabilities': ['beacon_info'],
	        'matchers': {
            'beacon_uuid.in': difference
          }
        }
        api.filterAllData(filterApi).then(response => {
          response.data.resources.forEach((resource) => {
            resource.capabilities.beacon_info.forEach((beacon) =>{
              repository.write(() => {
                repository.create('Beacon', new Beacon(beacon, new Build(beacon)));
              });
            });
          });
          let beaconsRepo = repository.objects('Beacon');
          console.log('BeaconService.saveData - beacon repo ' + JSON.stringify(beaconsRepo));
          repository.write(() => {
            repository.create('Position', position);
          });
        });
      } else {
        repository.write(() => {
          repository.create('Position', position);
        });
      }
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

  /**
   * Async function that call the api to generate the report
   * @param {Date} from Start time to search for positions
   * @param {Date} until Finish time to search for positions
   * @param {Object} beacon the beacon uuid to search for
   */
  async generateReport(from, until, beacon){
    let fromWithTimezone = moment(from).tz("America/Sao_Paulo");
    let untilWithTimezone = moment(until).tz("America/Sao_Paulo");
    let request = {
      'capabilities': ['location_monitoring'],
      'matchers':{
        'position.distances.uuid.eq': beacon
      },
      'start_date': fromWithTimezone.toDate(),
      'end_date': untilWithTimezone.toDate()
    };
    console.log('BeaconService.generateReport request ' + JSON.stringify(request));
    RealmRepository.dbOperation(repository => {
      let user = repository.objects('User')[0];
      console.log('here inside db ' + user.uuid);
      api.filterData(user.uuid, request).then(response => {
        console.log('BeaconService.generateReport response - ' + JSON.stringify(response));
        if(response.data.resources.length > 0){
          this.generatePDF(response.data, user);
        } else {
          alert('Você não possui dados nesse dia e hora');
        }
      }).catch(error => {
        console.log('BeaconService.generateReport - error to filter data ' + JSON.stringify(error.response) + ' ' + JSON.stringify(error));
      });
    });
  }

  /**
   * Function to generate the report file
   * @param {Object} data The return of Interscity api
   * @param {Object} user The current user
   */
  async generatePDF(data, user){
    let dateTime = moment(new Date()).format("YYYY-MM-DD-HH:mm:ss");
    let li = data.resources[0].capabilities.location_monitoring.map(position => 
      position.position.distances.map(distance => `<li>${distance.createdDate} Predio X a  ${distance.distance} metros de distancia do marcador<\/li>`).join("\n")
    ).join("\n");
    let options = {
      html: `<div style='display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;'>
          <h1>Relatorio de Presença</h1>
          <div>
              <p>
                  Atesto que que ${user.name} este presente nos locais e datas listados abaixo
              </p>
              
                  <ul style="line-height: 3;">
                      ${li}
                      <li>
                          01/10/2019 15:34 Predio B5 a 0.9 metros de distancia do marcador
                      </li>
                  </ul>
              
          </div>
      </div>`,
      fileName: 'Relatorio_Presenca_'+dateTime,
      directory: RNFS.ExternalStorageDirectoryPath+'/Documents'
    }
    let file = await RNHTMLtoPDF.convert(options);
    alert('Arquivo criado em ' + file.filePath);
  }
}