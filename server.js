const net = require('node:net');
const crypto = require('node:crypto');

const host = '127.0.0.1';
const tcpPort = 5000;

const defaultHttpResponse = '<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">\r\n<TITLE>200 OK</TITLE></HEAD><BODY>\r\n<H1>200 OK</H1>\r\nWelcome to the default.\r\n</BODY></HTML>\r\n\r\n'

const tcpServer = net.createServer((socket) => {
    let buffer = Buffer.alloc(0);
    let headerParsed = false;
    let [method, target, httpVersion, headersMap] = [];
    let secWebSocketAccept = '';
    let protoSwitch = false;
    const wsUUIDstring = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

    socket.on('data', (data) =>{
        buffer = Buffer.concat([buffer, data]);

        if (!headerParsed) {
            const boundary = buffer.indexOf('\r\n\r\n');
            if(boundary === -1){
                return;
            }
            console.log('Client Connected');
            const headerPart = buffer.slice(0, boundary).toString();
            [method, target, httpVersion, headersMap] = httpHeaderParser(headerPart);
            console.log(`method: ${method}; target: ${target}; httpVersion: ${httpVersion}; headersMap:`)
            console.log(headersMap);
            headerParsed = true;
            buffer = buffer.slice(boundary + 4)
        }
        console.log("control reached here 101")
        if(!protoSwitch) {
            console.log('control reching here as well')
            try {
                console.log("control reached here as well")
                console.log(isValidHandshakeRequest(method, httpVersion, headersMap))
                if (isValidHandshakeRequest(method, httpVersion, headersMap)){
                    console.log("control reached here")
                    const secWSaccept = headersMap['sec-websocket-key'];
                    const combined = secWSaccept + wsUUIDstring;
                    secWebSocketAccept = genSecWSaccept(combined.trim());
                    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${secWebSocketAccept}\r\n\r\n`);
                    protoSwitch = true;
                }
            } catch(err) {
                console.error(err);
                console.log("Headers are incomplete.")
        }}
    })

    
    
    socket.on('end', () => {
        console.log("Client Disconnected");
        
    });

    socket.on('error', (err) => {
        console.error(`Error: ${err}`);
    });
});

tcpServer.on('error', (err) => {
    throw err;
});

tcpServer.listen(tcpPort, host, () => {
    console.log(`server is listening on port: ${tcpPort} & host: ${host}`);
});

function httpHeaderParser(headers) {
    const headersArray = headers.split('\r\n');
    const [method, target, httpVersion] = headersArray[0].split(' ');
    const headersMap = {};
    for (let i = 1; i < headersArray.length; i++) {
        const [header, value] = headersArray[i].split(":");
        headersMap[header.toLowerCase()] = value.replace('\r', '');
    }       

    return [method, target, httpVersion, headersMap];
}


function isValidHandshakeRequest(method, httpVersion, headersMap) {

    const isGet = method == 'GET';
    const httpVersionNumber = parseFloat(httpVersion.split('/')[1]) >= 1.1;
    const headersValid = headersMap.upgrade == ' websocket' && headersMap.connection == ' Upgrade' && headersMap['sec-websocket-key'] && headersMap['sec-websocket-version'] == ' 13';
    // switch (headersMap) {
    //     case headersMap['upgrade'] != 'websocket':
    //         console.log('problem is with upgrade')    
    //         return headersValid;
    //     case headersMap['connection'] != 'Upgrade':
    //         console.log('problem is with connection');
    //         return headersValid;
    //     case headersMap['sec-websocket-version'] != '13':
    //         console.log('problem is with version');
    //         return headersValid;
    //     default : 
    //         return(isGet && httpVersionNumber && headersValid)
    // }
    return (isGet && httpVersionNumber && headersValid);
}

// compute sha1 hash and base64 encode it 
function genSecWSaccept(combined) {
    const hash = crypto.createHash('sha1').update(combined).digest('base64');
    console.log('this is the key ' + hash)
    return hash;
}