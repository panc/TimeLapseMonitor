var path = require('path');
var fs = require('fs');
var fsHelper = require('./fsHelper')();
var lwip = require('lwip');
    
var PHOTOS_FOLDER_NAME = 'camera';
var PHOTOS_DIR = __dirname + '/../' + PHOTOS_FOLDER_NAME;

var THUMBNAILS_FOLDER_NAME = 'thumbnails';
var THUMBNAILS_DIR = __dirname + '/../' + THUMBNAILS_FOLDER_NAME;

module.exports = function (settings, log) {

    var camera = require('./cameraHelper').createCamera();
    var stream = require('./streamHelper').createStream();

    var isTimelapseRunningBeforeStreaming;
    var onNewPhotosCallback;
    var onStateChangedCallback;
    var onStreamDataUpdatedCallback;
    var intervalHandle;
    
    // init file cache
    var files = fsHelper.mapFiles(PHOTOS_DIR, PHOTOS_FOLDER_NAME);
    var thumbnails = fsHelper.mapFiles(THUMBNAILS_DIR, THUMBNAILS_FOLDER_NAME, PHOTOS_FOLDER_NAME);

    stream.onStateChanged(function() {
        onStateChanged();
    });
    
    stream.onStreamDataUpdated(function (image) {
        onStreamDataUpdatedCallback(image);
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
        return {
            isTimelapseRunning: intervalHandle != undefined,
            isStreaming: stream.isRunning()
        };
    }
    
    var onStateChanged = function() {
        
        if (onStateChangedCallback)
            onStateChangedCallback(getTimelapseState());
    }

    var startTimelapse = function() {
        console.log('Starting timelapse...');

        intervalHandle = setInterval(takePhoto, settings.timeLapseInterval);

        onStateChanged();
    };

    var stopTimelapse = function() {
        console.log('Stopping timelapse...');

        clearInterval(intervalHandle);
        intervalHandle = undefined;
        
        onStateChanged();
    };
    
    return {
        onNewPhotosAvailable: function (newPhotosCallback) {
            onNewPhotosCallback = newPhotosCallback;
        },
        
        onStateChanged: function(stateChangedCallback) {
            onStateChangedCallback = stateChangedCallback;
        },
        
        onStreamDataUpdated: function (callback) {
            onStreamDataUpdatedCallback = callback;
        },

        takePhoto: takePhoto,
        
        triggerRefresh: reloadPhotos,
        
        startTimelapse: startTimelapse,

        stopTimelapse: stopTimelapse,
        
        startStream: function() {
            isTimelapseRunningBeforeStreaming = getTimelapseState().isTimelapseRunning;
            
            if (isTimelapseRunningBeforeStreaming)
                stopTimelapse();
            
            stream.start();
        },
        
        stopStream: function () {
            // restart timelapse if needed
            if (isTimelapseRunningBeforeStreaming)
                startTimelapse();

            stream.stop();
        },

        getTimelapseState: getTimelapseState
    };
};