import moment from 'moment';
import timezone from 'moment-timezone'

export default class Beacon {

    constructor(beacon, build){
        this.uuid = beacon.beacon_uuid;
        this.lat = beacon.lat;
        this.lng = beacon.lng;
        this.name = beacon.name;
        this.floor = beacon.floor;
        this.build = build;
        this.createdDate = beacon.date;
    }

    static schema = {
        name: 'Beacon',
        primaryKey: 'uuid',
        properties: {
            uuid: 'string',
            lat: {type: 'double', default: 0},
            lng: {type: 'double', default: 0},
            name: 'string',
            floor: 'int',
            build: 'Build',
            createdDate: 'date'
        }
    };

}