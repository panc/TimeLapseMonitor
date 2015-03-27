
module.exports = {
    reload: function () {
        
        // remove any stored image information
        sails.models.image.destroy({}).exec(function(err) {
            
            // reload image information from file system

            // TODO
        });
    }
};