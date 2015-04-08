var express = require('express');
var app = express();

var templatePath = __dirname + '/assets/templates/index.html';

// setup routes
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/camera', express.static(__dirname + '/camera'));
app.use('/vendor', express.static(__dirname + '/bower_components'));

app.get('/*', function (req, res) {
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

    socket.on('refresh', function () {
        camera.refresh();
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

camera.onNewPhotosAvailable(function(files) {
    
    sockets.map(function (socket) {
        socket.emit('new-photos', files);
    });
});

camera.startTimelapse();