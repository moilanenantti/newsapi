import { StyleSheet, Text, View, Pressable, TextInput, Button, BackHandler, ToastAndroid, StatusBar, Image } from 'react-native'
import { useState, useEffect } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ScrollableNews from './ScrollableNews'
import OptionBars from './assets/bars.png'

export default function App() { // this is the main app function

  const [apikey_alert, setApikey_alert] = useState(null) // here we save the structure of the window that prompts user to enter api key (null means nothing is rendered)
  const [options, setOptions] = useState(null) // save search bar structure here (null means nothing is rendered)
  const [news, setNews] = useState([]) // api response stored here
  const [newsapi_key, setNewsapi_key] = useState(null) // api key stored here

  const storeApiKey = async (value) => { // stores api key in async storage so that it's saved for when app is restarted
    try {
      await AsyncStorage.setItem('@newsapi_key', value)
      setNewsapi_key(value)
      console.log("api key saved to AsyncStorage")
    } catch (e) {
      ToastAndroid.show('Failed to save API key to storage.', ToastAndroid.SHORT)
    }
  }

  async function getApiKey() {  // when app is started this checks if an api key has been previoously saved to async storage (if yes then no need to enter it again) 
    try {
      const value = await AsyncStorage.getItem('@newsapi_key')
      if(value !== null) {
        console.log("api key found from AsyncStorage")
      }
      return value
    } catch(e) {
      console.log("failed to retrieve API key from storage (no api key saved?)")
      let errorMsg = "notfound"
      return errorMsg
    }
  }

  async function removeApikey() { // deletes current api key
    try {
      await AsyncStorage.removeItem('@newsapi_key')
    } catch(e) {
      console.log("failed to remove api key from async storage")
    }
  
    console.log('Done.')
  }
  
  const onStartUp = () =>  { // this is run on app startup
    let input = "" // api key's textinput is saved here
    getApiKey() //first check is an api key exists in async storage
    .then(value => { 
      if(value == "notfound" || value == null){ //if api key was not found on startup, call window that prompts the user to enter api key
        setApikey_alert(<>
          <View style={styles.apikeyAlert}>
            <Text>NEWS API KEY HAS NOT BEEN SET</Text>
            <Text>Please enter your API key</Text>
            <TextInput
              defaultValue={input}
              onChangeText={newValue => input = newValue}
              placeholder={'Enter API key'}
              style={styles.apikeyTextinput}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 10}}>
              <Button title="exit app" onPress={() => BackHandler.exitApp()} />
              <Button
                title="Continue"
                onPress={() => {
                  if(input){
                    var options = {
                      method: 'GET',
                      url: `https://newsapi.org/v2/top-headlines?country=us&apiKey=${input}`,
                      params: {},
                      headers: {}
                    }
                    axios.request(options).then(function (response) { // when user has entered api key, call news api to retrieve latest news
                      ToastAndroid.show('Success', ToastAndroid.SHORT) // inform user with a toast that api responded correctly
                      

                      storeApiKey(input) // if news api respåonded correctly then save api key to async storage

                      setNews(response.data) // save api response to app state
                      setApikey_alert(null) // closewindow that asks for api key to be entered
                    }).catch(function (error) {
                      ToastAndroid.show('Invalid API key or api server error', ToastAndroid.SHORT) // if api key was invalid or other error with news api occurred
                    })
                  } else {
                    ToastAndroid.show('Please enter API key', ToastAndroid.SHORT) // display toast if user pressed continue button without entering api key
                  }
                }} />
            </View>
          </View></>
      )
      } else { // this else is executed if api key was found from async storage on app startup
        setNewsapi_key(value) // save api key to app state
        var options = {
          method: 'GET',
          url: `https://newsapi.org/v2/top-headlines?country=us&apiKey=${value}`,
          params: {},
          headers: {}
        }
        axios.request(options).then(function (response) { // call news api to give app latest news
          ToastAndroid.show('Success', ToastAndroid.SHORT) // inform user with a toast that api responded correctly
          setNews(response.data) // save api response to app state
          setApikey_alert(null)
        }).catch(function (error) {
          ToastAndroid.show('Failed to retrieve news from API', ToastAndroid.SHORT) // if app failed to retrieve api data even when existing api key wsas saved, then inform user by a toast
        })
      }
    })

  }

  const handleSearch = (query) => { // this function handles news topic search
    var options = {
      method: 'GET',
      url: `https://newsapi.org/v2/everything?q=${query}&pageSize=40&apiKey=${newsapi_key}`,
      params: {},
      headers: {}
    }
    axios.request(options).then(function (response) {
      setNews(response.data) // save api response to app state
      ToastAndroid.show(`Showing first 40 results for "${query}"`, ToastAndroid.LONG) // inform user that query was successful
      setOptions(null) // close search bar
    }).catch(function (error) {
      ToastAndroid.show('Failed to retrieve news from API. Try restarting app', ToastAndroid.LONG) // inform user that query failed
    })
    }

    useEffect(() => {
      onStartUp() // call app startup function on app startup
    },[])

    const deleteApikeyClicked = () => {
      onStartUp()
      setOptions(null)
    } 

    const optionsClicked = () =>  { // execute this function whewn user clicks the three bars on the right side of app header
      if(!options && !apikey_alert){ // if search bar (here: options) is not visible and the user is not in the window that prompts him to enter api key
        let input = "" // save search textinput here
        setOptions(
          <View style={styles.options}>
            <Text style={styles.optionsText}>Search news by keyword:</Text>
            <TextInput
              style={styles.optionsTextinput}
              defaultValue={input}
              onChangeText={newValue => input = newValue}
              />
            <Text style={styles.searchBtn} onPress={() => handleSearch(input)}>Search</Text>
            <Text style={styles.deleteApikey} onPress={() => {setNewsapi_key(null); removeApikey().then(deleteApikeyClicked())}}>DELETE API KEY</Text>
          </View>
        )
      } else { // if user clicked the three bars in the header and search bar was already visible, then hide the search bar
        setOptions(null)
      }
    }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.logoNumbers}>247 <Text style={styles.logoText}>News</Text></Text>
        <Pressable onPress={() => optionsClicked()}>
          <Image style={styles.optionsBtn} source={OptionBars} />
        </Pressable>        
      </View> 
      {apikey_alert}
      {options}         
      <ScrollableNews params={news} />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ededed',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#072b63',
    width: '100%',
    height: 60,
    paddingLeft: 20,
    paddingRight: 20,
  },
  logoNumbers: {
    color: 'orange',
    fontSize: 35,
    fontWeight: 'bold',
  },
  logoText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
  },
  optionsBtn: {
    height: 50,
    width: 50,
  },
  options: {
    marginTop: 5,
    backgroundColor: '#072b63',
    width: '100%',
    padding: 10,
  },
  optionsText: {
    color: 'white',
    fontSize: 25,
    textAlign: 'center',
  },
  optionsTextinput: {
    backgroundColor: 'white',
    fontSize: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  searchBtn: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'right'
  },
  deleteApikey: {
    color: 'red',
    marginTop: 20,
    fontSize: 'bold',
    fontSize: 15,
    textAlign: 'center'
  },
  apikeyAlert: {
    padding: 50,
    width: '100%',
    justifyContent: 'center',
    height: '100%'
  },
  apikeyTextinput: {
    marginTop: 20,
    marginBottom: 20,
    height: 50,
    borderBottomWidth : 1.0
  }
});
