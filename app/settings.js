var fs = require('fs');

var SETTINGS_FILE = __dirname + '/../settings.json';

module.exports = function () {
    
    var settings = {
        numberOfPhotos: 5,
        timeLapseInterval: 60 * 1000 * 10, // ensure that the value is not smaller than 60 seconds
    }
    
    var writeSettingsToFile = function() {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings));
    }
    
    if (!fs.existsSync(SETTINGS_FILE)) {
        // store default settings
        console.info("No settings.json found. Use default settings ...");
        writeSettingsToFile();
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

    settings.save = writeSettingsToFile;

    return settings;
};