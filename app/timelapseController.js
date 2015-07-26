var path = require('path');
var fs = require('fs');
var fsHelper = require('./fsHelper')();
var lwip = require('lwip');
var cameraHelper = require('./cameraHelper');
    
var PHOTOS_FOLDER_NAME = 'camera';
var PHOTOS_DIR = __dirname + '/../' + PHOTOS_FOLDER_NAME;

var THUMBNAILS_FOLDER_NAME = 'thumbnails';
var THUMBNAILS_DIR = __dirname + '/../' + THUMBNAILS_FOLDER_NAME;

module.exports = function (settings, log) {

    var camera = cameraHelper.createCamera();
    var stream = cameraHelper.createStream();

    var onNewPhotosCallback;
    var onStateChangedCallback;
    var onStreamChangedCallback;
    var intervalHandle;
    
    // init file cache
    var files = fsHelper.mapFiles(PHOTOS_DIR, PHOTOS_FOLDER_NAME);
    var thumbnails = fsHelper.mapFiles(THUMBNAILS_DIR, THUMBNAILS_FOLDER_NAME, PHOTOS_FOLDER_NAME);

    stream.onStopped(function() {

    });
    
    stream.onStreamChanged(function (image) {
        onStreamChangedCallback(image);
    });  
    
    camera.on("exit", function (err, timestamp) {

        var file = files[files.length - 1];
        var thumbnailName = fsHelper.formatThumbnailName(file.name);
        var thumbnailFile = path.join(THUMBNAILS_DIR, thumbnailName);

        fs.exists(thumbnailFile , function (exists) {

            if (exists)
                reloadPhotos();
            else
                createThumbnail(file, thumbnailName);
        });
    });

    var createThumbnail = function (photo, thumbnailName) {

        console.log('Creating thumbnail for "' + photo.name + '".');

        thumbnails[thumbnails.length] = fsHelper.mapFile(thumbnailName, THUMBNAILS_FOLDER_NAME, PHOTOS_FOLDER_NAME);

        var photoPath = path.join(PHOTOS_DIR, photo.name);
        var thumbPath = path.join(THUMBNAILS_DIR, thumbnailName);

        lwip.open(photoPath, function(err, image) {
            
            if (err) {
                console.log("Failed to open image! ", err);
                log.error('Failed to open image "' + photoPath + '"!');
                return;
            }

            var scaleFactor = 200 / image.width();

            image.batch()
                .scale(scaleFactor) // scale to a width of 200px
                .writeFile(thumbPath, function(e) {
                    if (e) {
                        console.log("Failed to create thumbnail! ", e);
                        log.error('Failed to create thumbnail for "' + photoPath + '"!');
                        return;
                    }

                    console.log("Thumbnail successfully created!");
                    log.info('Photo "' + photo.name + '" successfully saved.');

                    reloadPhotos();
                });
        });
    };

    var takePhoto = function () {

        var fileName = fsHelper.formatFileName("Photo_", files.length);
        console.log("take photo " + fileName); 

        files[files.length] = fsHelper.mapFile(fileName, PHOTOS_FOLDER_NAME);

        camera.set('output', path.join(PHOTOS_DIR, fileName));
        camera.start(); 
    }
    
    var reloadPhotos = function () {
        
        if (onNewPhotosCallback)
            onNewPhotosCallback(thumbnails.slice(thumbnails.length - settings.numberOfPhotos).reverse());
    };
    
    var getTimelapseState = function() {
        return { state: intervalHandle != undefined };
    }
    
    return {
        onNewPhotosAvailable: function (newPhotosCallback) {
            onNewPhotosCallback = newPhotosCallback;
        },
        
        onStateChanged: function(stateChangedCallback) {
            onStateChangedCallback = stateChangedCallback;
        },
        
        onStreamChanged: function (streamChangedCallback) {
            onStreamChangedCallback = streamChangedCallback;
        },

        takePhoto: takePhoto,
        
        triggerRefresh: reloadPhotos,
        
        startTimelapse: function () {
            console.log('Starting timelapse...');
            
            intervalHandle = setInterval(takePhoto, settings.timeLapseInterval);

            if (onStateChangedCallback)
                onStateChangedCallback(getTimelapseState());
        },

        stopTimelapse: function () {
            console.log('Stopping timelapse...');

            clearInterval(intervalHandle);
            intervalHandle = undefined;

            if (onStateChangedCallback)
                onStateChangedCallback(getTimelapseState());
        },
        
        startStream: function() {
            stream.start();
        },
        
        stopStream: function () {
            
        },

        getTimelapseState: getTimelapseState
    };
};