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

// setup http server and socket connection
var http = require('http').Server(app);
var io = require('socket.io')(http);

var log = require('./app/log')(io);
var controller = require('./app/timelapseController.js')(settings, log);

io.on('connection', function (socket) {
    console.log("Socket ", socket.id, " connected via websocket!");

    socket.on('take-photo', function () {
        controller.takePhoto();
    });
    
    socket.on('start-timelapse', function () {
        controller.startTimelapse();
        log.info('Timelapse started!');
    });
    
    socket.on('stop-timelapse', function () {
        controller.stopTimelapse();
        log.info('Timelapse stopped!');
    });
    
    socket.on('request-timelapse-state', function (callback) {
        callback(controller.getTimelapseState());
    });

    socket.on('refresh-photos', function () {
        controller.triggerRefresh();
    });

    socket.on('request-settings', function(callback) {
        callback(settings);
    });

    socket.on('update-settings', function (data) {
        settings.update(data);
        
        console.log('Restart timelapse...');

        controller.stopTimelapse();
        controller.startTimelapse();

        io.emit('settings-updated', settings);
        log.info('Settings updateded.');
    });

    socket.on('disconnect', function () {
        console.log("Socket ", socket.id, " disconnected...");
    });
});

controller.onNewPhotosAvailable(function(files) {
    // broadcast to all connected sockets
    io.emit('new-photos', files);
});

controller.onStateChanged(function(state) {
    io.emit('timelapse-state-changed', state);
});

http.listen(3000, function () {
    console.log('Server is now listening on *:3000');
});

controller.startTimelapse();