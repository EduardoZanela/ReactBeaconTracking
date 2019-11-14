import RealmRepository from './../models/RealmRepository';
import InterSCity from './../api/InterSCityApi';

import User from './../models/User';

const api = new InterSCity();

/**
 * Class to concentrate the user operations
 */
export default class UserService{

  /**
   * Function to save the user
   * @param {Object} user User to be saved
   * @param {requestCallback} cb Callback request after save the user
   */
  saveUser(user, cb){
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
            RealmRepository.dbOperation((repository) => {
                repository.write(() => {
                    repository.create('User', userEntity);
                });
            });
            cb();
        })
        .catch(error => {
            console.log('UserService.saveUser - Not possible to save user, try again ' + JSON.stringify(error));
        });
  }
}