import React from 'react';
import { StyleSheet, Text, View, Button, AsyncStorage } from 'react-native';
import {ReactNativeAD, ADLoginView, Logger} from './azureADLib/index.js'


const CONFIG = {
  client_id : '02f47253-560c-477b-994d-fe0692792f86',
  // redirectUrl : 'http://localhost:8080(optional)',
  // authorityHost : 'https://login.microsoftonline.com//oauth2/authorize',
  // tenant  : 'common(optional)',
  // client_secret : 'client-secret-of-your-app(optional)',
  resources : [
    'https://graph.microsoft.com',
    // 'https://outlook.office.com',
    // 'https://outlook.office365.com',
    // 'https://wiadvancetechnology.sharepoint.com',
    // 'https://graph.windows.net',
  ]
}



Logger.setLevel('VERBOSE')

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      authenticationActive: false,
      loginWebViewVisible: false,
      logoutWebViewVisible: false,
      reactNativeAD: new ReactNativeAD(CONFIG)
    }
  }

  componentDidUpdate(){
    console.log(this.state)
  }

  async componentDidMount(){

    for (let resource of CONFIG.resources){
      let val = await this.state.reactNativeAD.checkCredential(resource)
      if(val===null){
        return
      }
    }
    // for (let resource in RESOURCES){
    //   let key = `${CLIENT_ID}.${resource}`;
    //   let val = AsyncStorage.getItem(key).then((value) => {
    //     console.log(value)
    //     if(value==null) {
    //       return value;
    //     }
    //   });
    //   if(val===null){
    //     return
    //   }
    // }

    this.setState(
      
      {
        ...this.state, 
        authenticationActive: true, 
        logoutWebViewVisible: false
      })
  }

  onLoginSuccess(credentials) {
    console.log(credentials)
    this.setState(
      {...this.state, 
        authenticationActive: true, 
        loginWebViewVisible: false})
  }

  afterLogout(status) {
    this.setState({
      ...this.state,
      authenticationActive: false, loginWebViewVisible: false, logoutWebViewVisible:false})
  }

  onLoginClick() {
    this.setState(
      {
        ...this.state, 
        loginWebViewVisible: true})
  }

  async onLogout() {
    for (let resource in CONFIG.resources){
      let key = `${CONFIG.client_id}.${resource}`
      await AsyncStorage.removeItem(key)
    }
    this.setState({
      ...this.state,
      authenticationActive: false, 
      loginWebViewVisible:true, 
      logoutWebViewVisible: true})

  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.authenticationActive ? 
          <View>
          <Text>Welcome to Testing App</Text>
          <Button title="Logout" onPress={() => this.onLogout.bind()} >  </Button>
          </View>
          : 

          <View>
            {this.state.loginWebViewVisible ? 
              <ADLoginView
              context={ReactNativeAD.getContext(CONFIG.client_id)}
              onSuccess={this.onLoginSuccess.bind(this)}
              afterLogout={this.afterLogout.bind(this)}
              hideAfterLogin={true}
              needLogout={this.state.logoutWebViewVisible} />
              :
              <Button title="Login" onPress={() => this.onLoginClick()}></Button>
            }
          </View>
          
        } 
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
