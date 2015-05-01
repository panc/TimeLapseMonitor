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

io.on('connection', function (socket) {
    console.log("Socket ", socket.id, " connected via websocket!");

    socket.on('take-photo', function () {
        controller.takePhoto();
    });
    
    socket.on('start-timelapse', function () {
        controller.startTimelapse();
        log('Timelapse started!');
    });
    
    socket.on('stop-timelapse', function () {
        controller.stopTimelapse();
        log('Timelapse stopped!');
    });

    socket.on('refresh-photos', function () {
        controller.triggerRefresh();
    });

    socket.on('request-settings', function(callback) {
        callback(settings);
    });

    socket.on('update-settings', function (data) {
        settings.update(data);
        controller.restartTimelapse();

        io.emit('settings-updated', settings);
        log('Settings updateded.');
    });

    socket.on('disconnect', function () {
        console.log("Socket ", socket.id, " disconnected...");
    });
});

var log = function(message) {
    io.emit('log-message', message);
}

controller.onNewPhotosAvailable(function(files) {
    // broadcast to all connected sockets
    io.emit('new-photos', files);
});

http.listen(3000, function () {
    console.log('Server is now listening on *:3000');
});

controller.startTimelapse();