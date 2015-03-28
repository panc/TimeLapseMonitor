/**
 * camera hook
 */

var os = require('os');
//var raspiCam = require('raspicam');

module.exports = function (sails) {
    
    var platform = os.platform();
    
//    if (platform.indexOf("win") == 0) {
//        sails.log.warn("Camera hook not started! The camera can only be used on a raspberry-pi!");
//        return {};
//    }

    return {
        initialize: function (next) {
            
            sails.after('hook:orm:loaded', function () {

                imageService.reload();
                
                // TODO:
                // init camera

                return next();
            });
        }
    };
};
