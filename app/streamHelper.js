var path = require('path');
var fs = require('fs');
var platform = require('os').platform();
var spawn = require('child_process').spawn;

var STREAM_FILE = "image_stream.jpg";
var STREAM_HTTP_NAME = 'stream/' + STREAM_FILE ;
var STREAM_FILEPATH = path.join(__dirname + '/../stream', STREAM_FILE);

module.exports = {
    createStream: function () {
        
        var onStateChangedCallback;
        var onStreamDataUpdatedCallback;
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

            onStateChangedCallback();
        }

        var stop = function() {
            
            console.log("Stop streaming...");

            timeoutHandle = undefined;

            if (platform.indexOf("win") != 0)
                stopStreaming();

            onStateChangedCallback();
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
                onStreamDataUpdatedCallback(STREAM_HTTP_NAME + '?_t=' + (Math.random() * 100000));
            }, 500);
        }
        
        var stopStreaming = function() {
            if (proc)
                proc.kill();

            clearInterval(intervalHandle);
            intervalHandle = undefined;
            proc = undefined;
        }

        return {
            start: start,
            
            stop: stop,

            onStreamDataUpdated: function(callback) {
                onStreamDataUpdatedCallback = callback;
            },

            onStateChanged: function (callback) {
                onStateChangedCallback = callback;
            },

            isRunning: function() {
                return timeoutHandle != undefined;
            }
        };
    }
};