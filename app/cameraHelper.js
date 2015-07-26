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
        
        if (platform.indexOf("win") == 0)
            console.log("Streaming is not supported on windows!");
            
        var onStoppedCallback;
        var onStreamChangedCallback;
        var timeoutHandle;
        var proc;
        
        function startStreaming() {
            
            if (proc) {
                onStreamChangedCallback(STREAM_FILE + '?_t=' + (Math.random() * 100000));
                return;
            }
            
            var args = ["-w", "640", "-h", "480", "-o", STREAM_FILEPATH, "-t", "999999999", "-tl", "1000"];
            proc = spawn('raspistill', args);
            
            console.log('Watching for changes...');
            
            fs.watchFile(STREAM_FILEPATH, function(current, previous) {
                onStreamChangedCallback(STREAM_FILE + '?_t=' + (Math.random() * 100000));
                console.log("Stream file changed!");
            });
        }
        
        function stopStreaming() {
            if (proc)
                proc.kill();

            proc = null;
            fs.unwatchFile('./stream/image_stream.jpg');
        }

        return {
            start: function () {

                timeoutHandle = setTimeout(function () {
                        // wait one minute...
                        timeoutHandle = null;
                        onStoppedCallback();

                        if (platform.indexOf("win") != 0)
                            stopStreaming();
                    },
                    60000);

                if (platform.indexOf("win") != 0)
                    startStreaming();
            },
            
            onStreamChanged: function(callback) {
                onStreamChangedCallback = callback;
            },

            onStopped: function (callback) {
                onStoppedCallback = callback;
            },

            stop: function() {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            },
        };
    }
};