var platform = require('os').platform();

module.exports = function (io) {
    
    var emitLogMessage = function (message, type) {
        io.emit('log-message', {
            message: message,
            type: type
        });
    }

    return {
        debug: function(message) {
            console.log(message);
        },

        info: function (message) {
            console.log(message);
            emitLogMessage(message, 'success');
        },

        error: function (message) {
            console.log(message);
            emitLogMessage(message, 'danger');
        }
    };
};