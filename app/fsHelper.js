var path = require('path');
var fs = require('fs');

var THUMBNAILS_PREFIX = 'Thumb_';

module.exports = function () {

    var mapFile = function(file, folderName, fullSizeFolderName) {
        var fullSizeImageUrl = "";

        if (fullSizeFolderName)
            fullSizeImageUrl = path.join(fullSizeFolderName, file.replace(THUMBNAILS_PREFIX, ""));

        return {
            name: file,
            url: path.join(folderName, file),
            fullSizeUrl: fullSizeImageUrl
        };
    };

    return {
        mapFile: mapFile,

        mapFiles: function(dir, folderName, fullSizeFolderName) {

            var files = fs.readdirSync(dir)
                .map(function (file) {
                    return mapFile(file, folderName, fullSizeFolderName);
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
        },

        formatThumbnailName: function (fileName) {
            return THUMBNAILS_PREFIX + fileName;
        }
    };
};