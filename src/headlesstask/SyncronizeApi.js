import InterSCity from './../api/InterSCityApi';
import Position from './../models/Position';
import Distance from './../models/Distance'
import Realm from 'realm';

const repository = new Realm({
  schema: [Position.schema, Distance.schema]
});
const api = new InterSCity();

const syncApi = async () => {
  console.log('Scheduler.syncApi - enter method');
  let positions = Array.from(repository.objects('Position').slice(0,10));
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
        'createdDate': position.createdDate,
        'distances': Array.from(position.distances)
      },
      'timestamp': position.createdDate
    };
    request.data.location_monitoring.push(insert);
  });
  api.createData('d2f1afff-2f61-4aae-9d9a-290adad2ac8a', request).then(response => {
    if(positions >= 1){
      repository.delete(positions);
    }
    console.log('Scheduler.syncApi - data sent');
  }).catch(error => {
    console.warn('Scheduler.syncApi - error to contact api ' + JSON.stringify(error.response) + ' ' + JSON.stringify(error));
  });
};

export default syncApi;