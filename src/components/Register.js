import React, { Component } from 'react';
import { View, 
  StyleSheet, 
  Button, 
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar } from 'react-native';

import RegisterForm from './RegisterForm';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default class Register extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
        <KeyboardAwareScrollView 
              extraHeight={200}
              style={{backgroundColor: '#ffffff'}}
              resetScrollToCoords={{ x: 0, y: 0 }}
              enableOnAndroid={true}
              contentContainerStyle={styles.container}
              scrollEnabled={false}
            > 
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={require('./../images/logoRegister.png')} />
            <Text style={styles.title}>Beacon Tracking Cadastro</Text>
          </View>
          <View style={styles.formContainer}>
            <RegisterForm navigation={this.props.navigation}/>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  formContainer: {
    justifyContent: 'flex-start'
  },
  logo: {
    width: 100,
    height: 100
  },
  logoContainer: {
    alignItems: 'center',
    margin: 50,
    justifyContent: 'flex-start',
    marginTop: 50 
  },
  title:{
    marginTop: 10,
    width: 250,
    textAlign: 'center',
    fontSize: 20
  }
});
