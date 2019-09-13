import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  FlatList,
  DeviceEventEmitter
} from 'react-native';
import PubSub from 'pubsub-js'
import BackgroundFetch from "react-native-background-fetch";

import BeaconListner from './src/services/BeaconListner'
import BeaconService from './src/services/BeaconService';

const beaconService = new BeaconService();

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      positions: []
    };
    // DELETE ALL POSITIONS
    //let allPositions = repository.objects('Position');
    //if(allPositions >= 1){
      //repository.delete(allPositions);
    //}
  }

  componentDidMount(){
    BeaconListner.startRangingBeacons();

    // CALL FUNCTION TO POPULATE STATE AND SHOW LAST BEACONS
    beaconService.findBeaconsByTime(5);
    PubSub.subscribe('NEW_BEACONS_ADD', (msg, data) => {
      console.log('APP.componentDidMount - on listner subscribe');
      this.state.positions = data;
    });
  }

  render() {
    console.log('APP.render - state positions ' + this.state.positions);
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.positions}
          renderItem={({item}) => <Text style={styles.item}>{item.id}</Text>}
        />
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})
