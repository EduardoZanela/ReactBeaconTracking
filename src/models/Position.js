import Utils from './../utils/Utils';
import moment from 'moment';
import timezone from 'moment-timezone';

export default class Position {

    constructor(distances){
        this.id = Utils.guid();
        this.lat = '';
        this.lng = '';
        this.distances = distances;
        this.createdDate =  moment(new Date()).tz("America/Sao_Paulo").toDate();
    }

    static schema = {
        name: 'Position',
        primaryKey: 'id',
        properties: {
            id: 'string',
            lat: {type: 'double', default: 0},
            lng: {type: 'double', default: 0},
            createdDate: 'date',
            distances: 'Distance[]'
        }
    };

}