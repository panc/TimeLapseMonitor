var express = require('express');
var app = express();

var fs = require('fs');
var path = require('path');

var IMAGE_PATH = 'camera';
var imageDirectory = path.join(process.cwd(), IMAGE_PATH);
var scripDirectory = path.join(process.cwd(), 'bower_components');
var templatePath = path.join(process.cwd(), 'assets/templates/index.html');

app.use('/assets', express.static('assets'));
app.use('/images', express.static('camera'));
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
console.log("Connecting via websocket!");

// Web Socket Connection
io.on('connection', function (socket) {
    
    // If we recieved a command from a client to start watering lets do so
    socket.on('ping', function (data) {
        console.log("ping");
        
        delay = data["duration"];
        
        // Set a timer for when we should stop watering
        setTimeout(function () {
            socket.emit("pong");
        }, delay * 1000);
      
    });
  
});

http.listen(3000, function () {
    console.log('listening on *:3000');
});