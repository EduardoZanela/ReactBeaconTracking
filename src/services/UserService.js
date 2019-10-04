import Realm from 'realm';
import InterSCity from './../api/InterSCityApi';

import User from './../models/User';

const api = new InterSCity();

export default class UserService{
  
  constructor(){}
  
  saveUser(user){
    let resource = {
        'data': {
            'description': user.name + ' ' + user.email,
            'capabilities': [
                'location_monitoring'
            ],
            'status': 'active',
            "lat": 0,
            "lon": 0
        }
    }
    api.createResource(resource)
        .then(response => {
            console.log(JSON.stringify(response));
            let userEntity = new User(user, response.data.data.uuid);
            Realm.open({
                path: 'anotherRealm.realm',
                schema: [User.schema]
            }).then(repository => {
                repository.write(() => {
                    repository.create('User', userEntity);
                });
            });
        })
        .catch(error => {
            console.log('UserService.saveUser - Not possible to save user, try again' + JSON.stringify(error.response));
        });
  }
}