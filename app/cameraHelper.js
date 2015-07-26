var platform = require('os').platform();

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
        
        console.log("Streaming is not supported on windows!");
            
        var onStoppedCallback;
        var onStreamChangedCallback;
        var timeoutHandle;
        var proc;
        
        function startStreaming(io) {
            
            if (proc) {
                onStreamChangedCallback('image_stream.jpg?_t=' + (Math.random() * 100000));
                return;
            }
            
            var args = ["-w", "640", "-h", "480", "-o", "./stream/image_stream.jpg", "-t", "999999999", "-tl", "100"];
            proc = spawn('raspistill', args);
            
            console.log('Watching for changes...');
            
            app.set('watchingFile', true);

            fs.watchFile('./stream/image_stream.jpg', function(current, previous) {
                onStreamChangedCallback('image_stream.jpg?_t=' + (Math.random() * 100000));
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
                console.log('Start dummy stream');

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