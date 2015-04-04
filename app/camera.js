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
            output: path.join(imageDirectory, 'RPI_%04d.jpg')
        });
    }

    camera.on("read", function (err, timestamp, filename) {
        console.log(err);
        console.log(timestamp);
        console.log("Picture taken: " + filename);
        
        // todo: rename photo

        onAfterNewPhoto();
    });
    
    var takePhoto = function () {
        
        // todo: or should we rename photo here?
        
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

        startTimelapse: function() {
            setInterval(takePhoto, 10000);
        }
    };
};