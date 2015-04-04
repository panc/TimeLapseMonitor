var express = require('express');
var app = express();

var fs = require('fs');
var path = require('path');

var IMAGE_PATH = 'camera';
var imageDirectory = path.join(process.cwd(), IMAGE_PATH);
var scripDirectory = path.join(process.cwd(), 'bower_components');
var templatePath = path.join(process.cwd(), 'assets/templates/index.html');

// setup routes

app.use('/assets', express.static('assets'));
app.use('/camera', express.static('camera'));
app.use('/vendor', express.static('bower_components'));

app.get('/images', function (req, res) {
    var files = fs.readdirSync(imageDirectory)
        .map(function (file) {
            return {
                name: file,
                url: path.join(IMAGE_PATH, file)
            };
    });
    
    res.json(files);
});

app.get('/', function (req, res) {
    res.sendFile(templatePath);
});


// setup camera
var platform = require('os').platform();
var camera;

if (platform.indexOf("win") == 0) {
    console.log("Camera not supported on windows!");
}
else {
    var raspicam = require('raspicam');
    camera = new raspicam({
        mode: 'photo',
        output: path.join(imageDirectory, 'test.jpg')
    });
    
    camera.start();
}

// setup http server and socket connection

var http = require('http').Server(app);
var io = require('socket.io')(http);
var sockets = [];

io.on('connection', function (socket) {
    sockets.push(socket);

    console.log("Connected via websocket!");

    // todo: emit message when photo is take by the camera

    socket.on('refresh', function (data) {
        refresh(sockets);
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

var refresh = function (socketsToRefresh) {
    
    // ensure that we are always working with an array, because 'socketsToRefresh' can also be a single socket object
    socketsToRefresh = [].concat(socketsToRefresh);

    if (socketsToRefresh.length == 0) {
        console.log("Refresh not needed as no socket is connected");
        return;
    }
    
    console.log("Collecting images for refresh ...");
    
    fs.readdir(imageDirectory, function (err, files) {
        
        files = files.map(function (file) {
            return {
                name: file,
                url: path.join(IMAGE_PATH, file)
            };
        });

        socketsToRefresh.map(function(socket) {
            socket.emit('new-items', files);
        });
    });
};