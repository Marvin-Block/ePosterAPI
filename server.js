const express = require("express");
const WebSocket = require("ws");
const fileUpload = require('express-fileupload');
const cors = require("cors");
const app = express();
const wss = new WebSocket.Server({port:3331});
global.__apiRoot = __dirname;

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// enable file handling
app.use(fileUpload({
  createParentPath: true
}))

// routes
require('./app/routes/video.routes')(app);
require('./app/routes/log.routes')(app);
require('./app/routes/device.routes')(app);
require('./app/routes/link.routes')(app);

// websocket
require('./app/websockets/index')(wss);

// set port, listen for requests
const PORT = 3333;
app.listen(PORT, () => {
  console.log(`Started at ${new Date()} running on port ${PORT}. Application root is ${__apiRoot}`);
});
