var fs = require('fs');

var SETTINGS_FILE = __dirname + '/../settings.json';

module.exports = function () {
    
    var settings = {
        numberOfPhotos: 5,
        timeLapseInterval: 60 * 1000 * 10,
    }
    
    var writeSettingsToFile = function(data) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data));
    }
    
    if (!fs.existsSync(SETTINGS_FILE)) {
        // store default settings
        console.info("No settings.json found. Use default settings ...");
        writeSettingsToFile(settings);
    }
    else {
        // read settings from file
        var content = fs.readFileSync(SETTINGS_FILE);
        settings = JSON.parse(content);
    }
    
    console.info("Loaded settings:");
    for(var s in settings) {
        console.info("\t-", s, ": \t", settings[s]);
    }

    settings.update = function(data) {

        if (data.numberOfPhotos && data.numberOfPhotos > 0 && data.numberOfPhotos < 50)
            settings.numberOfPhotos = data.numberOfPhotos;

        if (data.timeLapseInterval && data.timeLapseInterval > 60000) // ensure that the value is not smaller than 60 seconds
            settings.timeLapseInterval = data.timeLapseInterval;

        writeSettingsToFile(settings);
    };

    return settings;
};