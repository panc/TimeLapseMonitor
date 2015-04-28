var path = require('path');
var fs = require('fs');

module.exports = function () {

    var mapFile = function(file, folderName) {
        return {
            name: file,
            url: path.join(folderName, file)
        };
    };

    return {
        mapFile: mapFile,

        mapFiles: function(dir, folderName) {

            var files = fs.readdirSync(dir)
                .map(function (file) {
                    return mapFile(file, folderName);
                })
                .sort(function(a, b) {
                    if (b.name > a.name)
                        return -1;
                    if (b.name < a.name)
                        return 1;
                    return 0;
                });

            return files || [];
        },

        formatFileName: function (prefix, value) {
            return prefix + ("0000" + value).slice(-4) + ".jpg";
        }
    };
};