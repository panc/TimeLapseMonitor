var path = require('path');
var fs = require('fs');

var INTERVAL = 60000;
var IMAGE_PATH = 'camera';
var imageDirectory = path.join(process.cwd(), IMAGE_PATH);

module.exports = function () {

    var platform = require('os').platform();
    var camera;
    var onNewPhotoCallback;

    if (platform.indexOf("win") == 0) {
        console.log("Camera not supported on windows!");
    
        camera = {
            start: function () { console.log('Camera started (but on windows not supported)'); },
            stop: function () { },
            get: function (opt) { },
            set: function (opt, value) { },
            on: function (key, callback) { }
        };
    }
    else {
        var raspicam = require('raspicam');
        camera = new raspicam({
            mode: 'photo',
            output: 'dummy.jpg', // we have to provide an filename here, but it will be changed later on
            width: 2592,
            height: 1944,
            quality: 100
        });
    }

    camera.on("exit", function (err, timestamp, filename) {
        
        onAfterNewPhoto();
    });
    
    var takePhoto = function () {
        
        var format = function(value) {
            return ("0" + value).slice(-2);
        }

        var time = new Date();
        var fileName = time.getFullYear() +
            format(time.getMonth()) + 
            format(time.getDate()) + "_" + 
            format(time.getHours()) + 
            format(time.getMinutes()) + 
            format(time.getSeconds());

        camera.set('output', path.join(imageDirectory, fileName));
        camera.start();
    }
    
    var onAfterNewPhoto = function () {
        
        console.log("Collecting images for refresh ...");
        
        fs.readdir(imageDirectory, function (err, files) {
            
            files = files.map(function (file) {
                return {
                    name: file,
                    url: path.join(IMAGE_PATH, file)
                };
            });
        
            onNewPhotoCallback(files);
        });
    };
    
    return {
        onNewPhoto: function(newPhotoCallback) {
            onNewPhotoCallback = newPhotoCallback;
        },

        takePhoto: takePhoto,

        startTimelapse: function () {

            console.log('Starting timelapse...');
            setInterval(takePhoto, 10000);
        }
    };
};