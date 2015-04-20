var path = require('path');
var fs = require('fs');

var INTERVAL = 60000;
var IMAGE_PATH = 'camera';
var imageDirectory = __dirname + '/../' + IMAGE_PATH;

module.exports = function () {
    
    var platform = require('os').platform();
    var camera;
    var onNewPhotosCallback;
    
    // todo read settings from fs
    var settings = {
        numberOfPhotos: 5,
        timeLapseInterval: 60 * 1000, // ensure that the value is not smaller than 60 seconds
    }
    
    if (platform.indexOf("win") == 0) {
        console.log("Camera not supported on windows!");
        
        var onExitCallback;
        
        camera = {
            start: function () {
                console.log('Take dummy photo...');
                onExitCallback();
            },
            on: function (key, callback) {
                onExitCallback = callback;
            },
            stop: function () { },
            get: function (opt) { },
            set: function (opt, value) { }
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

        var ip = path.join(imageDirectory, "20150314_211848.jpg");
        var newip = path.join(imageDirectory, "small_20150314_211848.jpg");

        var lwip = require('lwip');
        lwip.open(ip, function (err, image) {

            var scaleFactor = 200 / image.width();

            image.batch()
                .scale(scaleFactor)// scale to a width of 200px
                .writeFile(newip, function (err) {
                    // todo: check err...
                  
                    reloadPhotos();
                });

        });
    });
    
    var takePhoto = function () {
        
        var format = function (value) {
            return ("00" + value).slice(-3);
        }
        
        fs.readdir(imageDirectory, function (err, files) {
            
            // We do not use the time stamp of the file
            // because when running on a raspberry there might
            // be no correctly configured date/time available.

            /*
            var time = new Date();
            var fileName = time.getFullYear() +
                format(time.getMonth()) + 
                format(time.getDate()) + "_" + 
                format(time.getHours()) + 
                format(time.getMinutes()) + 
                format(time.getSeconds());
            */
        
            var fileName = "Photo_" + format(files.length);
        
            camera.set('output', path.join(imageDirectory, fileName));
            camera.start(); 
        });
    }
    
    var reloadPhotos = function () {
        
        console.log("Collecting images for refresh ...");
        
        fs.readdir(imageDirectory, function (err, files) {
            
            files = files.map(function (file) {
                return {
                    name: file,
                    url: path.join(IMAGE_PATH, file)
                };
            })
            .sort(function(a, b) {
                if (b.name > a.name)
                    return -1;
                if (b.name < a.name)
                    return 1;
                    
                return 0;
                       
            })
            .slice(0, settings.numberOfPhotos);
            
            if (onNewPhotosCallback)
                onNewPhotosCallback(files);
        });
    };
    
    return {
        onNewPhotosAvailable: function (newPhotosCallback) {
            onNewPhotosCallback = newPhotosCallback;
        },
        
        takePhoto: takePhoto,
        
        refresh: reloadPhotos,
        
        startTimelapse: function () {
            
            console.log('Starting timelapse...');
            
            setInterval(takePhoto, settings.timeLapseInterval);
        }
    };
};