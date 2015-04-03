var express = require('express');
var app = express();

var fs = require('fs');
var path = require('path');

var IMAGE_PATH = 'camera';
var imageDirectory = path.join(process.cwd(), IMAGE_PATH);
var scripDirectory = path.join(process.cwd(), 'bower_components');
var templatePath = path.join(process.cwd(), 'assets/templates/index.html');

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

var http = require('http').Server(app);
var io = require('socket.io')(http);
var socket;

io.on('connection', function (s) {
    socket = s;

    console.log("Connected via websocket!");

    // todo: emit message when photo is take by the camera

    socket.on('refresh', function (data) {
        refresh();
    });
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

var refresh = function () {
    if (socket === undefined) {
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
        
        socket.emit('new-items', files);
    });
};