import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity
} from 'react-native';
const dgram = require('react-native-udp')
const Buffer = require('buffer/').Buffer
const socket = dgram.createSocket('udp4') //server imitation

// server events
socket.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    socket.close();
  });

socket.on('message', (msg, rinfo) => {
    const message = Buffer.from(msg).toString()
    console.log(`server got: ${message} from ${rinfo.address}:${rinfo.port}`);
  });

socket.on('listening', () => {
    const address = socket.address();
    console.log(`server listening ${address.address}:${address.port}`);
  });

socket.bind(43000);


// client events
const client = dgram.createSocket('udp4');

client.on('error', (err) => {
  console.log(`client error:\n${err.stack}`);
  client.close();
});

client.on('message', (msg, rinfo) => {
  const message = Buffer.from(msg).toString()
  console.log(`Client got: ${message} from ${rinfo.address}:${rinfo.port}`);
});

client.on('listening', () => {
  const address = client.address();
  console.log(`Client listening ${address.address}:${address.port}`);
});

client.bind(40000, () => {
  console.log(client.address())
});


var interval //global interval variable

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
    await this.setState({sending: false}) //set sending to false
    clearInterval(interval)
    client.close()
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

        const data = JSON.stringify(obj)
        const message = Buffer.from(data).toString('base64')

        client.send(message, 0, message.length, 43000, '0.0.0.0', err => {
          
          if(err)
            throw err
          
          console.log('Client sent ' + message.length + ' bytes');
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


          {/* Login Button */}
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
              // disabled={this.props.loading}
              >
                <Text style={{ color: 'white', fontFamily: 'HelveticaNeue-Medium', fontSize: 20 }}>{this.state.sending ? 'Stop' : 'Start Sending'}</Text>
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