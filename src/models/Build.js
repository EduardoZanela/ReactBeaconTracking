import Utils from './../utils/Utils';
import moment from 'moment';
import timezone from 'moment-timezone'

export default class Build {

    constructor(beacon){
        this.id = Utils.guid();
        this.description = beacon.build.description;
        this.initials = beacon.build.initials;
        this.name = beacon.build.name;
        this.createdDate = beacon.date;
    }

    static schema = {
        name: 'Build',
        primaryKey: 'id',
        properties: {
            id: 'string',
            name: 'string',
            initials: 'string',
            description: 'string',
            createdDate: 'date'
        }
    };

}