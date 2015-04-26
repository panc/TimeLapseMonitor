var path = require('path');
var fs = require('fs');
var fsHelper = require('./fsHelper')();
var lwip = require('lwip');

var PHOTOS_FOLDER_NAME = 'camera';
var PHOTOS_DIR = __dirname + '/../' + PHOTOS_FOLDER_NAME;

var THUMBNAILS_FOLDER_NAME = 'thumbnails';
var THUMBNAILS_DIR = __dirname + '/../' + THUMBNAILS_FOLDER_NAME;

module.exports = function () {
    
    var camera = require('./cameraHelper').createCamera();
    var settings = require('./settings')();

    var onNewPhotosCallback;
    
    // init file cache
    var files = fsHelper.mapFiles(PHOTOS_DIR, PHOTOS_FOLDER_NAME);
    var thumbnails = fsHelper.mapFiles(THUMBNAILS_DIR, THUMBNAILS_FOLDER_NAME);
    
    camera.on("exit", function (err, timestamp) {

        var file = files[files.length - 1];
        var thumbnailName = "Tumb_" + file.name;
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

        thumbnails[thumbnails.length] = fsHelper.mapFile(thumbnailName, THUMBNAILS_FOLDER_NAME);

        var photoPath = path.join(PHOTOS_DIR, photo.name);
        var thumbPath = path.join(THUMBNAILS_DIR, thumbnailName);

        lwip.open(photoPath, function(err, image) {

            var scaleFactor = 200 / image.width();

            image.batch()
                .scale(scaleFactor) // scale to a width of 200px
                .writeFile(thumbPath, function(e) {
                    // todo: check err...
                    if (e) {
                        console.log("Failed to create thumbnail! ", e);
                        return;
                    }

                    console.log("Thumbnail successfully created!");
                    reloadPhotos();
                });
        });
    };

    var takePhoto = function () {

        var fileName = fsHelper.formatFileName("Photo_", files.length);
        
        console.log("foramt file value: ", files.length);
        console.log("take photo " + fileName); 

        files[files.length] = fsHelper.mapFile(fileName, PHOTOS_FOLDER_NAME);

        camera.set('output', path.join(PHOTOS_DIR, fileName));
        camera.start(); 
    }
    
    var reloadPhotos = function () {
        
        if (onNewPhotosCallback)
            onNewPhotosCallback(thumbnails.slice(0, settings.numberOfPhotos));
    };
    
    return {
        onNewPhotosAvailable: function (newPhotosCallback) {
            onNewPhotosCallback = newPhotosCallback;
        },
        
        takePhoto: takePhoto,
        
        triggerRefresh: reloadPhotos,
        
        startTimelapse: function () {
            
            console.log('Starting timelapse...');
            
            setInterval(takePhoto, settings.timeLapseInterval);
        }
    };
};