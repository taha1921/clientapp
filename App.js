import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, Dimensions, TouchableOpacity } from 'react-native';
const dgram = require('react-native-udp')
const Buffer = require('buffer/').Buffer
const RNFS = require('react-native-fs')

var interval //global interval variable
var test_number = 1;

// const socket = dgram.createSocket('udp4') //server imitation
// // server events
// socket.on('error', (err) => {
//     console.log(`server error:\n${err.stack}`);
//     socket.close();
//   });

// socket.on('message', (msg, rinfo) => {
//   // parse packet
//   const message = Buffer.from(msg).toString()
//   const packet = JSON.parse(message);

//   // calculate delay
//   var date = new Date();
//   var timestamp = Math.floor(date.getTime());
//   var delay = timestamp - parseInt(packet.timestamp)

//   // write output to file
//   var toWrite = JSON.stringify({ 'id': packet.id, 'timestamp_Sent': packet.timestamp, 'timestamp_Recv': timestamp, 'delay': delay }) + "\n"
//   RNFS.write(`${RNFS.ExternalDirectoryPath}/test_${test_number}.txt`, toWrite)
//     .catch(err => {
//       console.log(err.message);
//     });
//   });

// socket.on('listening', () => {
//     const address = socket.address();
//     console.log(`server listening ${address.address}:${address.port}`);
//   });

// socket.bind(43000);


// client events
const client = dgram.createSocket('udp4');

client.on('error', (err) => {
  console.log(`client error:\n${err.stack}`);
  client.close();
});

client.on('message', (msg, rinfo) => {
  // parse message
  const message = Buffer.from(msg).toString()
  const packet = JSON.parse(message);

  // calculate delay
  var date = new Date();
  var timestamp = Math.floor(date.getTime());
  var delay = timestamp - parseInt(packet.timestamp)

  // write output to file
  var toWrite = JSON.stringify({ 'id': packet.id, 'timestamp_Sent': packet.timestamp, 'timestamp_Recv': timestamp, 'delay': delay }) + "\n"
  RNFS.write(`${RNFS.ExternalDirectoryPath}/test_${test_number}.txt`, toWrite)
    .catch(err => {
      console.log(err.message);
    });
});

client.on('listening', () => {
  const address = client.address();
  // console.log(`Client listening ${address.address}:${address.port}`);
});

client.bind(40000, () => {
  console.log(client.address())
});



export default class App extends Component{

  constructor(props){
    super(props)

    this.state = {
      sending_rate: '',
      packet_size: '',
      sending: false, //currently sending?
      id: 1 //id of first packet
    }
  }
  
  //function called when we press stop
  stopSending = async () => {
    await this.setState({
      sending: false,
      id: 1
    }) //set sending to false
    clearInterval(interval)
    test_number += 1
  }

  //function called when we want to start sending packets
  startSending = async () => {
    if (this.state.sending_rate != '' && this.state.packet_size != '') {
      const rate = parseInt(this.state.sending_rate)
      const size = parseInt(this.state.packet_size)

      await this.setState({sending: true})
      interval = setInterval(() => {
        var date = new Date();
        var timestamp = date.getTime();

        const obj = {
          timestamp: timestamp,
          id: this.state.id,
          garbage: ''
        }

        var temp = JSON.stringify(obj)
        var bytes_left = size - temp.length
        var garbage = '0'.repeat(bytes_left)
        obj.garbage = garbage

        date = new Date();
        timestamp = date.getTime();
        obj.timestamp = timestamp

        const data = JSON.stringify(obj)
        const message = Buffer.from(data).toString('base64')

        client.send(message, 0, message.length, 40000, '203.135.63.19', err => {
          
          if(err)
            throw err
          
          this.setState(prevstate => (
              {id: prevstate.id + 1}
            ))
        })
        
      }, rate);
    }
    else
    {
      alert('both fields must be filled')
    }

  } 
  
  render() {
    return (
      <View style={{ flex: 1, height: '100%' }}>
        <ScrollView>

          <View style={{ marginTop: '21.67%', marginLeft: '5.33%' }}>
            <Text style={{ fontFamily: 'HelveticaNeue-Bold', fontSize: 28, color: '#252325' }}>Enter the following fields!</Text>
          </View>

          {/* Sending Rate field */}
          <View style={{ marginTop: '5%', marginHorizontal: '5.33%' }}>
            <TextInput
              style={styles.Input}
              placeholder="Sending Rate (ms)"
              onChangeText={(sending_rate) => this.setState({ sending_rate })}
              value={this.state.sending_rate}
              keyboardType='number-pad'
            />
          </View>

          {/* Packet size field */}
          <View style={{ marginTop: '3%', marginHorizontal: '5.33%' }}>
            <TextInput
              style={styles.Input}
              placeholder="Packet size (bytes)"
              onChangeText={(packet_size) => this.setState({ packet_size })}
              value={this.state.packet_size}
              keyboardType='number-pad'
            />
          </View>


          {/* Send/Stop Button */}
          <View style={{ marginTop: '5%', width: '100%', alignSelf: 'center' }}>
            <TouchableOpacity style={{
              marginHorizontal: Dimensions.get('window').width * 0.05,
              height: Dimensions.get('window').height * 0.06,
              backgroundColor: 'black',
              widht: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
            }}
              activeOpacity={0.7}
              onPress={() => {
                !this.state.sending ?
                this.startSending()
                :
                this.stopSending()
              }}
              >
                <Text style={{ color: 'white', fontFamily: 'HelveticaNeue-Medium', fontSize: 20 }}>{this.state.sending ? 'Stop' : 'Start Sending'}</Text>
            </TouchableOpacity>
          </View>

          {
            this.state.sending ? 
            <View style={{marginTop: '20%', alignItems: 'center'}}>
              <Text>{`Sending Packet ${this.state.id}`}</Text>
            </View>
            :
            <View></View>
          }
          {/* Request File */}
          <View style={{marginTop: '50%', width: '100%', alignSelf: 'center'}}>
            <TouchableOpacity style={{
              marginHorizontal: Dimensions.get('window').width * 0.05,
              height: Dimensions.get('window').height * 0.06,
              backgroundColor: 'red',
              widht: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
            }}
              activeOpacity={0.7}
              
            >
              <Text style={{ color: 'white', fontFamily: 'HelveticaNeue-Medium', fontSize: 20 }}>Request File</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  Input: {
    height: Dimensions.get('window').height * 0.06,
    borderColor: '#E2E2E3',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: '4%',
    paddingVertical: '1.97%'
  },

  Container: {
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    borderColor: '#E2E2E3',
    justifyContent: 'center',
    width: Dimensions.get('window').width * 0.43,
    height: Dimensions.get('window').height * 0.05
  }
})