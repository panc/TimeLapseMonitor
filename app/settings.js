module.exports = function () {
    
    // todo read settings from fs

    return {
        numberOfPhotos: 5,
        timeLapseInterval: 60 * 1000 * 10, // ensure that the value is not smaller than 60 seconds
    };
};