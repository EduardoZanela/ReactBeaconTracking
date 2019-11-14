import Realm from 'realm';
import User from './User';
import Position from './Position';
import Distance from './Distance'
import Beacon from './Beacon';
import Build from './Build';

export default class RealmRepository{

    static dbOperation(callback){
        Realm.open({
            schema: [Position.schema, Distance.schema, User.schema, Beacon.schema, Build.schema]
        }).then(repository => {
            callback(repository);
        });
    }
}