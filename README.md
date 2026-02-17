# WebSocket Server (Learning Implementation)

## Introduction

This project is a **from-scratch WebSocket server built on top of raw TCP sockets in Node.js**.
The goal was not to create a production-ready server, but to deeply understand how WebSockets work under the hood by manually implementing the core protocol pieces.

The implementation walks through the protocol step-by-step:

* TCP socket handling
* HTTP upgrade handshake
* WebSocket frame parsing
* Masking/unmasking logic
* Sending frames back to the client

The project intentionally stops after core bidirectional messaging is achieved.
From this point onward, real projects should use established libraries (`ws`, `uWebSockets.js`, etc.), but this implementation serves as a strong conceptual foundation.

---

## Features

* Raw TCP server using Node.js `net` module
* Manual HTTP → WebSocket upgrade handshake
* Header parsing and validation
* WebSocket frame decoding (client → server)
* Masked payload handling
* Support for payloads ≤125 bytes
* Server → client text frame encoding
* Echo functionality
* Buffer-safe frame parsing
* Handles multiple frames in a single TCP packet

---

## Requirements

* Node.js (v18+ recommended)
* Basic understanding of:

  * TCP sockets
  * Buffers
  * Bitwise operations
  * Event-driven programming in Node.js

Optional tools for testing:

* `wscat`
* Browser console WebSocket client
* curl (for handshake testing)

---

## Ideas for Improvement (Optional — Not Implemented by Design)

This project intentionally stops after core learning milestones.
If someone wants to extend it further:

* Handle payloads >125 bytes
* Support extended payload lengths (126/127)
* Implement fragmentation handling
* Add ping/pong frames
* Implement proper close handshake
* Add broadcast support
* Add multiple client management
* Convert to production-ready architecture
* Replace with `ws` library and compare behavior

These were intentionally not implemented to keep the project focused on learning fundamentals.

---

## File Structure

```
project-root/
│
├── server.js
├── client.js
└── README.md
```

---

## Learning Notes

This implementation is for educational purposes only.

It demonstrates:

* how WebSocket frames are structured
* why masking exists
* how TCP buffering works
* how protocol state transitions occur

It is **not intended for production use**.

For real applications, use a maintained WebSocket library:

* `ws`
* `uWebSockets.js`
* `socket.io` (higher level)

---

## Final Thoughts

The purpose of this project was to remove the “magic” from WebSockets by building the core mechanics manually.
Once the fundamentals are understood, using a library becomes far more meaningful and easier to debug.

This repository marks the end of the learning phase and the transition into building real-world projects.
