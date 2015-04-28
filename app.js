var express = require('express');
var app = express();
var settings = require('./app/settings')();

var templatePath = __dirname + '/assets/templates/index.html';

// setup routes
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/camera', express.static(__dirname + '/camera'));
app.use('/thumbnails', express.static(__dirname + '/thumbnails'));
app.use('/vendor', express.static(__dirname + '/bower_components'));

app.get('/*', function (req, res) {
    res.sendFile(templatePath);
});

// setup camera
var controller = require('./app/timelapseController.js')(settings);

// setup http server and socket connection
var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = [];

io.on('connection', function (socket) {
    sockets.push(socket);
    
    console.log("Connected via websocket!");

    socket.on('takePhoto', function () {
        controller.takePhoto();
    });

    socket.on('refresh', function () {
        controller.triggerRefresh();
    });

    socket.on('updateSettings', function(data) {
        settings.update(data);

        // todo: restart timelapse with new interval...
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

controller.onNewPhotosAvailable(function(files) {
    
    sockets.map(function (socket) {
        socket.emit('new-photos', files);
    });
});

controller.startTimelapse();