const net = require("node:net");
const crypto = require("node:crypto");
const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";


const client = new net.Socket();

const httpHeaders =
  "GET /chat HTTP/1.1\r\n" +
  "Host: 127.0.0.1:5000\r\n" +
  "Upgrade: websocket\r\n" +
  "Connection: Upgrade\r\n" +
  "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==\r\n" +
  "Sec-WebSocket-Version: 13\r\n" +
  "\r\n";

client.connect(5000, "127.0.0.1", () => {
  console.log("Connected to server");
  client.write(httpHeaders);

  // 🔑 Critical: send frame AFTER handshake, not waiting on data event
//   setTimeout(() => {
//     sendWebSocketTextFrame("hello from client");
//   }, 500);
});

client.on("data", (data) => {
  console.log("Received from server:");
  console.log(data.toString());
  const response = data.toString();

    const isValid = validateHandshakeResponse(
        response,
        "x3JJHMbDL1EzLkh9GBhXDw=="
    );

    console.log("Handshake valid:", isValid);
    if (isValid) {
        // now send your WebSocket frame
        sendWebSocketTextFrame("hello from client");
        client.end();
    } else {
        console.error("Invalid WebSocket handshake");
        client.destroy();
    }

});

client.on("close", () => {
  console.log("Connection closed");
});

client.on("error", (err) => {
  console.error("Error:", err.message);
});

function sendWebSocketTextFrame(message) {
  const payload = Buffer.from(message, "utf8");
  const payloadLength = payload.length;

  const byte1 = 0x81; // FIN + text frame
  const byte2 = 0x80 | payloadLength; // MASK set + length

  const maskingKey = Buffer.from([
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ]);

  const maskedPayload = Buffer.alloc(payloadLength);
  for (let i = 0; i < payloadLength; i++) {
    maskedPayload[i] = payload[i] ^ maskingKey[i % 4];
  }

  const frame = Buffer.concat([
    Buffer.from([byte1, byte2]),
    maskingKey,
    maskedPayload,
  ]);

  console.log("Sending WebSocket frame:", message);
  client.write(frame);
}



function validateHandshakeResponse(response, clientKey) {
    // 1. Split headers
    const lines = response.split("\r\n");

    // 2. Validate status line
    const statusLine = lines[0];
    if (!statusLine.startsWith("HTTP/1.1 101")) {
        return false;
    }

    // 3. Parse headers
    const headers = {};
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const index = line.indexOf(":");
        if (index === -1) continue;

        const key = line.slice(0, index).toLowerCase();
        const value = line.slice(index + 1).trim().toLowerCase();
        headers[key] = value;
    }

    // 4. Required headers
    if (headers["upgrade"] !== "websocket") {

        return false;
    }

    if (!headers["connection"] || !headers["connection"].includes("upgrade")) {
        return false;
    }

    if (!headers["sec-websocket-accept"]) {
        return false;
    }

    // 5. Compute expected accept key
    const expectedAccept = crypto
        .createHash("sha1")
        .update(clientKey + WS_GUID)
        .digest("base64");

    // 6. Compare
    return headers["sec-websocket-accept"] === expectedAccept.toLowerCase();
}
