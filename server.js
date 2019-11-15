//arbitrary Values for now
var PORT = 46000;
var HOST = '127.0.0.1';

const dgram = require('dgram')
const fs = require('fs')
var server = dgram.createSocket('udp4');
var writeStream = fs.createWriteStream('serverLog.txt')

server.on('listening', function() {
 var address = server.address();
 console.log('UDP Server listening on ' + address.address + ':' + address.port);
});

//{timestamp: hr:min:sec, id: int}
server.on('message', function(message, remote) {
 console.log('server handling received message: '+remote.address + ':' + remote.port +' - ' + message);
 const msg = JSON.parse(String.fromCharCode.apply(String, message));
 var timestamp = Math.floor(Date.now());
 var delay = timestamp - parseInt(msg.timestamp)
 //Log delay, timestamp id
 var toWrite = JSON.stringify({'id':msg.id,'timestamp_Sent':msg.timestamp,'timestamp_Recv':timestamp,'delay':delay})+"\n"
 writeStream.write(toWrite,'utf-8')
 var toSend = JSON.stringify({'id':parseInt(msg.id)+1,'timestamp':timestamp})

 async function ax(){
    await new Promise(resolve=>{
        setTimeout(resolve,20);
    })
    await server.send(toSend,remote.port,remote.address,(err)=>{
        if (err) throw err;
    })
}
ax()
.then(console.log('UDP messages sent to '+remote.address+':'+remote.port))
.catch(console.error)
});

server.on('close',function(){
    console.log('Server now closed')
    writeStream.end()
})

server.bind(PORT, HOST);