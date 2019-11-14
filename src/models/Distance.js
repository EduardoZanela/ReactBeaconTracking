import Utils from './../utils/Utils';
import moment from 'moment';
import timezone from 'moment-timezone'

export default class Distance {

    constructor(uuid, distance){
        this.id = Utils.guid();
        this.uuid = uuid;
        this.distance = distance;
        this.createdDate = moment(new Date()).tz("America/Sao_Paulo").toDate();
    }

    static schema = {
        name: 'Distance',
        primaryKey: 'id',
        properties: {
            id: 'string',
            uuid: 'string',
            distance: {type: 'double', default: 0},
            createdDate: 'date'
        }
    };

}