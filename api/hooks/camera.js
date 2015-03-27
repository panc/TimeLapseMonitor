/**
 * camera hook
 */

module.exports = function (sails) {
    
    //var raspiCam = require('raspicam');

    return {
        initialize: function (next) {
            sails.after('hook:orm:loaded', function () {

                imageService.reload();

                return next();
            });
        }
    };
};
