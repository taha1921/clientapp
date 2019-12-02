const dgram = require('dgram')
var client = dgram.createSocket('udp4');
var id = 1
const size = 1504

const send = async () => {
    await client.bind(40000)
    setInterval(() => {
        var date = new Date();
        var timestamp = date.getTime();

        const obj = {
            timestamp: timestamp,
            id: id,
            garbage: ''
        }

        var temp = JSON.stringify(obj)
        var bytes_left = size-temp.length
        var garbage = '0'.repeat(bytes_left)
        obj.garbage = garbage

        const data = JSON.stringify(obj)
        const message = Buffer.from(data)

        client.send(message, 0, message.length, 46000, '127.0.0.1', (err, bytes) => {
            if (err)
                throw err
            console.log('Client sent ' + bytes + ' bytes');
            id += 1
        })
    }, 20);
}
send()