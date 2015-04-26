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
    }
};