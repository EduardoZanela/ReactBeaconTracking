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

import RealmRepository from './src/models/RealmRepository';
import Register from './src/components/Register';
import App from './App';

export default class Initial extends Component {
    
    constructor(props){
        super(props)
        this.state = {
            loggedIn: false,
            finishDatabase: false
        };
        this.isLoggedIn();
    }

    isLoggedIn(){
        RealmRepository.dbOperation((repository) => {
            this.setState({
                finishDatabase: true
            });
            if (repository.objects('User')[0]){
                console.log('User: ' + JSON.stringify(repository.objects('User')[0]));
                this.setState({
                    loggedIn: true
                });
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.loggedIn && <App />}
                {this.state.finishDatabase && !this.state.loggedIn && <Register />}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});