var os = require('os');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var directory = path.join(process.cwd(), 'uploads/images');
sails.log(directory);

module.exports = {
    reload: function () {
        
        var platform = os.platform();
        
        if (platform.indexOf("win") == 0) {
            sails.log.warn("Reloading images is only working linux!");
            return;
        }  

        // remove any stored image information
        sails.models.image.destroy({}).exec(function(err) {

            fs.rmdirSync('');

            // reload image information from file system

            // TODO
        });
    }
};