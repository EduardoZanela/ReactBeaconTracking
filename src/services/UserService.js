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
            'status': 'active'
        }
    }
    api.createResource(resource)
        .then(response => {
            let userEntity = new User(user, response.uuid);
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
            console.log('UserService.saveUser - Not possible to save user, try again');
        });
  }
}