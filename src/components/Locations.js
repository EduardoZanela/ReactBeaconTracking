/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList
} from 'react-native';
import PubSub from 'pubsub-js';
import BeaconService from './../services/BeaconService';
import Resources from './../constants/Constants';

const beaconService = new BeaconService();

export default class Location extends React.Component{

  constructor(props){
    super(props);
    this.state = {
        positions: []
    };

    PubSub.subscribe('NEW_BEACONS_ADD', (msg, data) => {
        console.log('APP.constructor - on listner subscribe + ' + data);
        this.setState({
          positions: data
        });
    });
  }

  componentDidMount(){
    this.loadData();
    //setInterval(this.loadData(), Resources.ONE_MINUTE_IN_MILLI_SECONDS*2);
  }

  loadData(){
    beaconService.findBeaconsByTime(Resources.BEACONS_TO_SHOW);
  }

  navigateLocation(){
    this.props.navigation.navigate('Location');
  }

  navigateReport(){
    this.props.navigation.navigate('Home');
  }

  deleteUser(){
    RealmRepository.dbOperation((repository) => {
      let userEntity = repository.objects('User');
        repository.write(() => {
            repository.delete(userEntity);
            this.props.navigation.dispatch(resetAction);
        });
    });
  }

  render(){
    return (
      <React.Fragment>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <FlatList
              data={this.state.positions}
              renderItem={({item}) => <Text style={styles.item}>{item.id}</Text>}
              />
          </View>
          <View style={{flexDirection:'row', paddingVertical: 20}}>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>
              <TouchableOpacity onPress={this.deleteUser.bind(this)}>
                <Image style={{width: 25, height: 25}} source={require('./../images/icons8-map-24.png')}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.navigateReport.bind(this)}>
                <Image style={{width: 25, height: 25}} source={require('./../images/icons8-google-forms-50.png')}/>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.navigateLocation.bind(this)}>
                <Image style={{width: 25, height: 25}} source={require('./../images/location-map.png')}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
       
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  // Title
  titleContainer:{
    marginBottom: 35,
    marginTop: 50
  },
});
