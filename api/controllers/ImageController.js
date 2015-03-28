
var fs = require('fs');
var path = require('path');

var directory = path.join(process.cwd(), 'camera');

module.exports = {
    
    download: function (req, res) {
        var file = path.join(directory, req.params.image);
        
        fs.exists(file, function (exists) {
            if (!exists) 
                return res.notFound(file);
            
            fs.createReadStream(file).pipe(res);
        });
    }
};