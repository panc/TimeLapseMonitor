var fs = require('fs');
var path = require('path');

var IMAGE_PATH = 'camera';
var directory = path.join(process.cwd(), IMAGE_PATH);

module.exports = {
    reload: function () {
        
        // remove any stored image information
        sails.models.image.destroy({}).exec(function(err) {
            
            // reload image information from file system

            var files = fs.readdirSync(directory);
            files.forEach(function(file) {

                sails.models.image
                .create({
                    name: file,
                    url: path.join(IMAGE_PATH, file)
                })
                .exec(function (err, created) {
                    sails.log.debug('Created image with name ' + created.name);
                });
            });
        });
    }
};