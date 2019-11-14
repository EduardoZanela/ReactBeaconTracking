import moment from 'moment';
import timezone from 'moment-timezone'
import InterSCity from './../api/InterSCityApi';
import RealmRepository from './../models/RealmRepository';

const api = new InterSCity();

const createRequest = (positions) => {
  var request = { 
    'data': {
      'location_monitoring': []
    }
  }
  positions.forEach(position => {
    let insert = {
      'position': {
        'id': position.id,
        'lat': position.lat,
        'lng': position.lng,
        'createdDate': position.createData,
        'distances': Array.from(position.distances)
      },
      'timestamp': moment(position.createdDate).tz("America/Sao_Paulo").toDate()
    };
    request.data.location_monitoring.push(insert);
  });
  return request;
};

const syncApi = async () => {
  console.log('Scheduler.syncApi - enter method');

  RealmRepository.dbOperation((repository) => {
    let positions = Array.from(repository.objects('Position').slice(0, 30));
    let user = repository.objects('User')[0];
    if(positions.length > 0 && user !== 'undefined'){
      var request = createRequest(positions);
      let uuid = user.uuid;
      console.log('request length ' + request.data.location_monitoring.length + ' ' + uuid);
      api.createData(uuid, request).then(response => {
        if(positions.length >= 1){
          repository.write(() => {
            repository.delete(positions);
          });
        }
        console.log('Scheduler.syncApi - data sent, left registers ' + repository.objects('Position').length);
      }).catch(error => {
        console.warn('Scheduler.syncApi - error to contact api ' + JSON.stringify(error.response) + ' ' + JSON.stringify(error));
      });
    }
  });

};

export default syncApi;