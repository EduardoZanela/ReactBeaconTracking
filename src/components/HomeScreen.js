import React from 'react';
import {
  View,
  Text,
  Picker,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import BeaconService from './../services/BeaconService';

import { StackActions, NavigationActions } from 'react-navigation';
import RealmRepository from './../models/RealmRepository';
const resetAction = StackActions.reset({
  index: 0, // <-- currect active route from actions array
  actions: [
    NavigationActions.navigate({ routeName: 'Home' }),
  ],
});

const beaconService = new BeaconService();

export default class HomeScreen extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      user: {'uuid': ''},
      beacons: [],
      pickerValueHolder: '',
      isTimePickerFromVisible: false,
      isTimePickerUntilVisible: false,
      timeFrom: '',
      timeUntil: '',
      timeFromDateFormat: new Date(),
      timeUntilDateFormat: new Date(),
      timeFromError: false,
      timeUntilError: false
    };
    this.findUser();
  }

  componentDidMount(){
    this.findBeacons();
  }

  findUser(){
    RealmRepository.dbOperation(repository => {
      let user = repository.objects('User')[0];
      this.setState({
        user: user
      });
    });
  }

  findBeacons(){
    RealmRepository.dbOperation(repository => {
      let beacons = repository.objects('Beacon');
      this.setState({
        beacons: beacons
      });
    });
  }

  showTimeFromPicker(){
    this.setState({ isTimePickerFromVisible: true });
  }

  hideTimeFromPicker(){
    this.setState({ isTimePickerFromVisible: false });
  }

  handleTimeFromPicked(date){
    console.log("A date has been picked: ", date);
    this.setState({
      timeFrom: this.formatDate(date),
      timeFromDateFormat: date,
      timeFromError: false
    });
    this.hideTimeFromPicker();
  }
  showTimeUntilPicker(){
    this.setState({ isTimePickerUntilVisible: true });
  }

  hideTimeUntilPicker(){
    this.setState({ isTimePickerUntilVisible: false });
  }

   handleTimeUntilPicked(date){
    console.log("A date has been picked: ", date);
    this.setState({
      timeUntil: this.formatDate(date),
      timeUntilDateFormat: date,
      timeUntilError: false
    });
    this.hideTimeUntilPicker();
  }

  formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes;
    var month = date.getMonth()+1;
    console.log('aqui');
    return date.getDate() + "/" + month + "/" + date.getFullYear() + "  " + strTime;
  }

  generateReport(){
    this.state.timeFrom === '' ? this.setState({timeFromError: true}) : this.setState({timeFromError: false});
    this.state.timeUntil === '' ? this.setState({timeUntilError: true}) : this.setState({timeUntilError: false});
    if(this.state.timeFromError || this.state.timeUntilError){
        // SHOW ERROR
        console.log('error pick a date');
    } else {
        beaconService.generateReport(this.state.timeFromDateFormat, this.state.timeUntilDateFormat, this.state.pickerValueHolder);
    }
  }

  navigateReport(){
    this.props.navigation.navigate('Home');
  }

  navigateLocation(){
    this.props.navigation.navigate('Location');
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
            <Text style={styles.title}>Relatorio de Presença</Text>
            <Text> My id: {this.state.user.uuid }</Text>
          </View>
          <View style={styles.shaddowContainer}>
            <Picker
              mode="dropdown"
              selectedValue={this.state.pickerValueHolder}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) => this.setState({pickerValueHolder: itemValue})} >
              {
                this.state.beacons.map((item, index) => {
                  return (<Picker.Item label={item.name} value={item.uuid} key={index}/>) 
                })
              }
            </Picker>
          </View>
          <View style={[styles.dateTimeContainer, styles.shaddowContainer]}>
            <View style={{flex: 1}}>
              <Text style={{color: 'rgba(153, 153, 153, 0.8)', paddingBottom: 5}}>Inicio:</Text>
              <Text style={{color: 'rgba(125, 125, 125, 1)', fontSize: 20, marginBottom: 5}}>{this.state.timeFrom}</Text>
              { this.state.timeFromError && <Text style={{color: 'red', marginBottom: 5}}>Selecione uma data válida</Text> }
              <TouchableOpacity style={[styles.pickDateButton, {marginBottom: 15}]} onPress={this.showTimeFromPicker.bind(this)} >
                <Text style={styles.buttonText}>Selecionar</Text>
              </TouchableOpacity>
              
              <Text style={{color: 'rgba(153, 153, 153, 0.8)', paddingBottom: 5}}>Fim:</Text>
              <Text style={{color: 'rgba(125, 125, 125, 1)', fontSize: 20, marginBottom: 5}}>{this.state.timeUntil}</Text>
              { this.state.timeUntilError && <Text style={{color: 'red', marginBottom: 5}}>Selecione uma data válida</Text> }
              <TouchableOpacity style={styles.pickDateButton} onPress={this.showTimeUntilPicker.bind(this)} >
                <Text style={styles.buttonText}>Selecionar</Text>
              </TouchableOpacity>
              
              
              <DateTimePicker
                mode='datetime'
                timePickerModeAndroid='spinner'
                isVisible={this.state.isTimePickerFromVisible}
                onConfirm={this.handleTimeFromPicked.bind(this)}
                onCancel={this.hideTimeFromPicker.bind(this)}
              />
              <DateTimePicker
                mode='datetime'
                timePickerModeAndroid='spinner'
                isVisible={this.state.isTimePickerUntilVisible}
                onConfirm={this.handleTimeUntilPicked.bind(this)}
                onCancel={this.hideTimeUntilPicker.bind(this)}
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.touchableButton} onPress={this.generateReport.bind(this)}>
              <Text style={styles.buttonText}>Solicitar</Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#4a1d78'
  },

  //Picker
  shaddowContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'white',
    ...elevationShadowStyle(5)
  },
  picker: {
    flex: 1,
    textAlign: 'center'
  },

  // Time Picker
  dateTimeContainer:{
    marginTop: 20,
    padding: 30
  },
  pickDateButton:{
    backgroundColor: '#4a1d78',
    alignItems: 'center',
    padding: 5,
    borderRadius: 20
  },

  // Button
  buttonContainer:{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  }, 
  touchableButton:{
    flex: 1,
    backgroundColor: '#4a1d78',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center'
  },
  buttonText:{
    color: '#fff',
    fontSize: 20
  },

});

function elevationShadowStyle(elevation) {
  return {
    elevation,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.5 * elevation },
    shadowOpacity: 0.3,
    shadowRadius: 0.8 * elevation
  };
}
