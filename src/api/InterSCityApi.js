import axios from 'axios';

const URL = 'http://192.168.0.152:8000';

export default class InterSCity {
    
    constructor(){
        this.instance = axios.create({
            baseURL: URL,
            timeout: 1000,
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

}