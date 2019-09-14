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
import PubSub from 'pubsub-js';
import SyncAdapter from 'react-native-sync-adapter';

import BeaconListner from './src/services/BeaconListner'
import BeaconService from './src/services/BeaconService';
import Resources from './src/constants/Constants';

const beaconService = new BeaconService();
const syncInterval = Resources.SYNC_INTERVAL_IN_SECONDS;
const syncFlexTime = Resources.SYNC_FLEX_TIME;

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      positions: []
    };
    SyncAdapter.init({
      syncInterval,
      syncFlexTime,
    });

    BeaconListner.startRangingBeacons();

    // CALL FUNCTION TO POPULATE STATE AND SHOW LAST BEACONS
    beaconService.findBeaconsByTime(Resources.BEACONS_TO_SHOW);

    PubSub.subscribe('NEW_BEACONS_ADD', (msg, data) => {
      console.log('APP.constructor - on listner subscribe + ' + data);
      this.setState({
        positions: data
      });
    });
    console.warn("were");
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
