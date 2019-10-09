import Realm from 'realm';
import User from './../models/User';
import Position from './../models/Position';
import Distance from './../models/Distance'

export default class RealmRepository{

    static dbOperation(callback){
        Realm.open({
            schema: [Position.schema, Distance.schema, User.schema]
        }).then(repository => {
            callback(repository);
        });
    }
}