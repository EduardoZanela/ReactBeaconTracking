import axios from 'axios';
//192.168.0.107:8000
//172.17.8.109:8000 -> upf local interscity
//177.67.253.26:8000 -> upf outside
const URL = 'http://177.67.253.26:8000';

export default class InterSCity {

    constructor(){
        this.instance = axios.create({
            baseURL: URL,
            timeout: 5000,
            headers: {}
        });
    }

    getResource(uuid){
        return this.instance.get('/catalog/resources/'+uuid);
    }

    createResource(resource){
        return this.instance.post('/adaptor/resources', resource);
    }

    createData(uuid, data){
        return this.instance.post('/adaptor/resources/'+uuid+'/data', data);
    }

    filterData(uuid, filter){
    return this.instance.post('/collector/resources/' + uuid + '/data', filter);
    }

    filterAllData(filter){
        return this.instance.post('/collector/resources/data', filter);
    }

}