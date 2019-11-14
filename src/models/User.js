import Utils from './../utils/Utils';
import moment from 'moment';
import timezone from 'moment-timezone';

export default class User {

    constructor(user, uuid){
        this.id = Utils.guid();
        this.name = user.name;
        this.phoneNumber = user.phone;
        this.email = user.email;
        this.uuid = uuid;
        this.createdDate = moment(new Date()).tz("America/Sao_Paulo").toDate();
    }

    static schema = {
        name: 'User',
        primaryKey: 'id',
        properties: {
            id: 'string',
            name: 'string',
            phoneNumber: 'string',
            email: 'string',
            uuid: 'string',
            createdDate: 'date'
        }
    };

}