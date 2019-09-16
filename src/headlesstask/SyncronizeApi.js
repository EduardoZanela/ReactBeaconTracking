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
  let positions = repository.objects('Position');
  var data = {
    'location_monitoring': []
  }
  positions.forEach(position => {
    data.location_monitoring.push({
      'position': position,
      'timestamp': position.createdDate
    });
  });
  api.createData('70c45ba8-811f-470f-a362-e6caa345dce4', data).then(() => {
    if(positions >= 1){
      repository.delete(positions);
    }
    console.log('Scheduler.syncApi - data sent');
  }).catch(error => {
    console.warn('Scheduler.syncApi - error to contact api ' + error);
  });
};

export default syncApi;