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
    
    var log = function(s) {
        console.info("\t numberOfPhotos:\t", s.numberOfPhotos);
        console.info("\t timeLapseInterval:\t", s.timeLapseInterval);
    }
    
    console.info("Loaded settings:");
    log(settings);

    settings.update = function(data) {

        var hasChanged = false;

        if (data.numberOfPhotos && data.numberOfPhotos > 0 && data.numberOfPhotos < 50 && data.numberOfPhotos != this.numberOfPhotos) {
            hasChanged = true;
            this.numberOfPhotos = data.numberOfPhotos;
        }

        if (data.timeLapseInterval && data.timeLapseInterval >= 60000 && data.timeLapseInterval != this.timeLapseInterval)
        {
            // ensure that the value is not smaller than 60 seconds
            hasChanged = true;
            this.timeLapseInterval = data.timeLapseInterval;
        }
        
        if (hasChanged) {
            writeSettingsToFile(this);

            console.info("Successfully stored new settings:");
            log(this);
        }
        else {
            console.info("Nothing to update...");
        }
    };

    return settings;
};