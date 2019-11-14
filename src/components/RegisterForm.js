import React, { Component } from 'react';
import { View, 
    StyleSheet, 
    TextInput, 
    Text,
    TouchableOpacity,
    StatusBar } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';

import UserService from './../services/UserService';

const resetAction = StackActions.reset({
    index: 0, // <-- currect active route from actions array
    actions: [
      NavigationActions.navigate({ routeName: 'Home' }),
    ],
});


const userService = new UserService();

export default class RegisterForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            validName: true,
            validPhone: true,
            validEmail: true,
            validSubmmit: true,
            nameText: '',
            phoneText: '',
            emailText: ''
        }
    }
    allFieldsValid(){
        return this.state.validName && this.state.validPhone && this.state.validEmail;
    }
    
    validateNull(text){
        this.validateSubmmitButton();
        if(!text){
            return false;
        } else {
            return true;
        }
    }

    validatePhone(text){
        if(text.lenght == 10 || text.lenght == 11){
            return true
        } else {
            return false;
        }
    }

    validateSubmmitButton(){
        this.setState({
            validSubmmit: this.allFieldsValid()
        });
    }

    submmitForm(){
        let register = {
            name: this.state.nameText,
            phone:  this.state.phoneText,
            email: this.state.emailText
        }
        if(this.allFieldsValid){
            userService.saveUser(register, this.callbackRedirect.bind(this));
            console.log('value: ', register);
        }
    }

    callbackRedirect(){
        console.log('redirect');
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        return (
            <View style={styles.container}>
                <TextInput
                    ref={(input) => this.nameInput = input} 
                    onEndEditing={(e) => {
                        this.setState({
                            validName: this.validateNull(e.nativeEvent.text),
                            nameText: e.nativeEvent.text
                        });
                        this.validateSubmmitButton();
                    }}
                    onSubmitEditing={() => this.emailInput.focus()}
                    returnKeyType='next' 
                    style={[styles.input, !this.state.validName ? styles.errorInput : styles.validInput]}
                    placeholder='Nome' />
                {
                    !this.state.validName && <Text style={styles.errorText}>O campo nome não pode ser vazio</Text>
                }
                <TextInput
                    onEndEditing={(e) => {
                        this.setState({
                            validPhone: this.validateNull(e.nativeEvent.text),
                            phoneText: e.nativeEvent.text
                        });
                        this.validateSubmmitButton();
                    }}
                    ref={(input) => this.phoneInput = input}
                    onSubmitEditing={() => this.emailInput.focus()}
                    returnKeyType='next'
                    keyboardType='numeric'
                    style={[styles.input, !this.state.validPhone ? styles.errorInput : styles.validInput]}
                    placeholder='Telefone'/>
                {
                    !this.state.validPhone && <Text style={styles.errorText}>O campo telefone não pode ser vazio</Text>
                }
                <TextInput
                    onEndEditing={(e) => {
                        this.setState({
                            validEmail: this.validateNull(e.nativeEvent.text),
                            emailText: e.nativeEvent.text
                        });
                        this.validateSubmmitButton();
                    }}
                    ref={(input) => this.emailInput = input}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='email-address'
                    returnKeyType='go'
                    style={[styles.input, !this.state.validEmail ? styles.errorInput : styles.validInput]}
                    placeholder='E-mail'/>
                {
                    !this.state.validEmail && <Text style={styles.errorText}>O campo e-mail não pode ser vazio</Text>
                }
                <TouchableOpacity 
                    onPress={()=>this.submmitForm()}
                    disabled={!this.state.validSubmmit} 
                    style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    input: {
        height: 40,
        backgroundColor: 'rgba(227, 227, 227, 0.2)',
        paddingHorizontal: 10
    },
    button: {
        backgroundColor: 'rgba(227, 227, 227, 1)',
        paddingVertical: 15
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '700'
    },
    errorInput: {
        borderWidth: 1,
        borderColor: '#ff0000',
        marginBottom: 5
    },
    validInput: {
        borderWidth: 0,
        marginBottom: 20
    },
    errorText: {
        color: '#ff0000',
        marginBottom: 10
    }
});