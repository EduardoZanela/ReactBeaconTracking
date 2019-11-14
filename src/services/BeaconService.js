import moment from 'moment';
import timezone from 'moment-timezone';;
import PubSub from 'pubsub-js';;
import RealmRepository from './../models/RealmRepository';
import {AppState} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';

import Position from './../models/Position';
import Distance from './../models/Distance';
import Resources from './../constants/Constants';
import InterSCityApi from './../api/InterSCityApi';
import Beacon from './../models/Beacon';
import Build from './../models/Build';;

const api = new InterSCityApi();

/**
 * Class that concentrates the beacon operations
 */
export default class BeaconService {
  /**
   * Constructor of Beacon Service
   * @constructor
   */
  constructor() {
    this.state = {
      appState: AppState.currentState,
    };
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  /**
   *  Function to update the state prop wiht application's state
   *  @param {string} nextAppState The next state
   */
  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');;
    }
    this.state.appState = nextAppState;
  };

  /**
   * Async function to save scanned beacons to realm database
   * @param {Object} data Beacons returned by native module
   */
  async saveData(data) {
    // CREATE ARRAY OF DISTANCES
    var distances = [];

    // Create the distances object based on beacon type iBeacon/Eddystone and push to array
    data.beacons.forEach(beacon => {
      if  (beacon.uuid) {
        distances.push(
          new Distance(
            beacon.uuid + ';' + beacon.major + ';' + beacon.minor,
            beacon.distance,
          ),
        );
      } else {
        distances.push(
          new Distance(
            beacon.namespaceId + ';' + beacon.instanceId,
            beacon.distance,
          ),
        );
      }
    });

    // Create a position object with distances
    let position = new Position(distances);

    // Open connection with database
    RealmRepository.dbOperation(repository => {
      // Find the the nearest beacon
      let minDistanceBeacon = position.distances.reduce((prev, current) => {
        return prev.distance < current.distance ? prev : current;
      });

      // Create query to search if beacon exists in local database
      let scannedUuids = position.distances.map(distance => distance.uuid);
      let query = scannedUuids
        .map(uuid => "uuid == '" + uuid + "'")
        .join(' OR ');

      // Seach on database
      let beacons = repository.objects('Beacon');
      let filteredBeacons = beacons.filtered(query);

      // Find the ones that is not saved to create request to api
      let mapDbUuid = filteredBeacons.map(b => b.uuid);
      let difference = scannedUuids.filter(x => !mapDbUuid.includes(x));

      if (difference.length > 0) {
        let filterApi = {
          capabilities: ['beacon_info'],
          matchers: {
            'beacon_uuid.in': difference,
          },
        };;

        // Find the beacons on api to save locally
        api.filterAllData(filterApi).then(response => {
          response.data.resources.forEach(resource => {
            resource.capabilities.beacon_info.forEach(beacon => {
              repository.write(() => {
                repository.create(
                  'Beacon',
                  new Beacon(beacon, new Build(beacon)),
                );
              });
            });
          });
          if (response.data.resources.length > 0) {
            PubSub.publish('UPDATE_BEACONS_REPO', {msg: 'updated'});
          }
          // Save beacon with lat and lng of the nearest one
          let beaconRepo = repository
            .objects('Beacon')
            .filtered("uuid == '" + minDistanceBeacon.uuid + "'");
          if  (beaconRepo.length > 0) {
            position.lat = beaconRepo[0].lat;;
            position.lng = beaconRepo[0].lng;;
          }
          repository.write(() => {
            repository.create('Position', position);
          });
        });
      } else {
        let beaconRepo = repository
          .objects('Beacon')
          .filtered("uuid == '" + minDistanceBeacon.uuid + "'");
        if  (beaconRepo.length > 0) {
          position.lat = beaconRepo[0].lat;;
          position.lng = beaconRepo[0].lng;;
        }
        repository.write(() => {
          repository.create('Position', position);
        });
      }
    });
  }

  /**
   * Function async to update state with last positions
   * @param {number} time Tempo em minutos para busca dos ultimos registros
   */
  async findBeaconsByTime(number) {
    console.log('BeaconService.findBeaconsByTime - enter update beacons');

    RealmRepository.dbOperation(repository => {
      let positions = repository
        .objects('Position')
        .sorted('createdDate', true)
        .slice(0, number);
      console.log(
        'BeaconService.findBeaconsByTime - objects filtered from repo ' +
          positions.length,
      );
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
  async generateReport(from, until, beacon) {
    let fromWithTimezone = moment(from).tz('America/Sao_Paulo');
    let untilWithTimezone = moment(until).tz('America/Sao_Paulo');
    let request = {
      capabilities: ['location_monitoring'],
      matchers: {
        'position.distances.uuid.eq': beacon,
      },
      start_date: fromWithTimezone.toDate(),
      end_date: untilWithTimezone.toDate(),
    };
    var dif = (untilWithTimezone.toDate() - fromWithTimezone.toDate());
    dif = (Math.round((dif/1000)/60) / 5)*0.75;
    console.log(
      'BeaconService.generateReport request ' + JSON.stringify(request),
    );
    RealmRepository.dbOperation(repository => {
      let user = repository.objects('User')[0];
      console.log('here inside db ' + user.uuid);
      api
        .filterData(user.uuid, request)
        .then(response => {
  
        // Seach on database
        let beacons = repository.objects('Beacon');
        let filteredBeacons = beacons.filtered("uuid == '" + beacon + "'")

          if (response.data.resources.length > 0) {
            this.generatePDF(response.data, user, dif, filteredBeacons[0]);
          } else {
            alert(Resources.REPORT_POSITIONS_NOT_FINDED);
          }
        })
        .catch(error => {
          console.log(
            'BeaconService.generateReport - error to filter data ' +
              JSON.stringify(error.response) +
              ' ' +
              JSON.stringify(error),
          );
        });
    });
  }

  /**
   * Function to generate the report file
   * @param {Object} data The return of Interscity api
   * @param {Object} user The current user
   */
  async generatePDF(data, user, dif, beacon) {
    let dateTime = moment(new Date()).format('YYYY-MM-DD-HH:mm:ss');
    if(data.resources[0].capabilities.location_monitoring.length >= dif){
      console.log("Atingiu frequencia");
    }
    let li = data.resources[0].capabilities.location_monitoring
      .map(position =>
        position.position.distances
          .map(
            distance =>
              `<li>${moment(distance.createdDate).tz('America/Sao_Paulo').format('DD/MM/YYYY HH:mm')} - à ${Math.round(distance.distance)} metros de distancia do marcador<\/li>`,
          )
          .join('\n'),
      )
      .join('\n');
    let options = {
      html: `
      <div style='display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  text-align: center;'>
        <h1>Relatorio de Presença</h1>
        <div>
          <p>
            Atesto que que ${
              user.name
            } esteve ao alcance do marcador ${beacon.name} localizado em ${beacon.build.name} nas datas e distancias listadas abaixo
          </p>
          <ul style="line-height: 3;">
            ${li}
          </ul>
        </div>
      </div>`,
      fileName: 'Relatorio_Presenca_' + dateTime,
      directory: RNFS.ExternalStorageDirectoryPath + '/Documents',
    };;
    let file = await RNHTMLtoPDF.convert(options);
    alert(Resources.REPORT_CREATED + file.filePath);
  }
}

