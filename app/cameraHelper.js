var path = require('path');
var fs = require('fs');
var platform = require('os').platform();
var spawn = require('child_process').spawn;

var STREAM_FILE = "image_stream.jpg";
var STREAM_HTTP_NAME = 'stream/' + STREAM_FILE ;
var STREAM_FILEPATH = path.join(__dirname + '/../stream', STREAM_FILE);

module.exports = {
    createCamera: function () {
            
        if (platform.indexOf("win") == 0) {
            console.log("Camera not supported on windows!");
                
            var onExitCallback;
                
            return {
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
            return new raspicam({
                mode: 'photo',
                output: 'dummy.jpg', // we have to provide an filename here, but it will be changed later on
                width: 2592,
                height: 1944,
                quality: 100
            });
        }
    },

    createStream: function () {
        
        var onStoppedCallback;
        var onStreamChangedCallback;
        var timeoutHandle;
        var intervalHandle;
        var proc;
        
        var start = function() {
            
            // wait one minute then stop the stream ...
            timeoutHandle = setTimeout(stop, 60000);
            
            if (platform.indexOf("win") == 0)
                console.log("Streaming is not supported on windows!");
            else
                startStreaming();
        }

        var stop = function() {
            
            console.log("Stop streaming...");

            timeoutHandle = undefined;
            onStoppedCallback();

            if (platform.indexOf("win") != 0)
                stopStreaming();
        };

        var startStreaming = function() {
            
            // if streaming is aleady running, do not start it again
            if (proc) {
                console.log("Streaming is aleady running - do not start it again");
                return;
            }

            var args = ["-w", "640", "-h", "480", "-o", STREAM_FILEPATH, "-t", "999999999", "-tl", "500"];
            proc = spawn('raspistill', args);
            
            console.log('Streaming started - watching for file changes.');

            intervalHandle = setInterval(function() {
                onStreamChangedCallback(STREAM_HTTP_NAME + '?_t=' + (Math.random() * 100000));
            }, 500);
        }
        
        function stopStreaming() {
            if (proc)
                proc.kill();

            clearInterval(intervalHandle);
            intervalHandle = undefined;
            proc = undefined;
        }

        return {
            start: start,
            
            stop: stop,

            onStreamChanged: function(callback) {
                onStreamChangedCallback = callback;
            },

            onStopped: function (callback) {
                onStoppedCallback = callback;
            }
        };
    }
};