var path = require('path');
var express = require('express');
var app = express();

var templatePath = path.join(process.cwd(), 'assets/templates/index.html');

// setup routes
app.use('/assets', express.static('assets'));
app.use('/camera', express.static('camera'));
app.use('/vendor', express.static('bower_components'));

app.get('/', function (req, res) {
    res.sendFile(templatePath);
});

// setup camera
var camera = require('./app/camera.js')();

// setup http server and socket connection
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = [];

io.on('connection', function (socket) {
    sockets.push(socket);
    
    console.log("Connected via websocket!");

    socket.on('takePhoto', function () {
        camera.takePhoto();
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

camera.onNewPhoto(function(files) {
    
    sockets.map(function (socket) {
        socket.emit('new-items', files);
    });
});

camera.startTimelapse();