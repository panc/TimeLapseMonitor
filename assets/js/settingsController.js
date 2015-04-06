'use strict';

angular.module('tlm')
.controller('settingsController', [
    '$scope', 'socket', function($scope, socket) {

        $scope.save = function() {
            socket.emit('update-settings', { /* data */});
        }
        
        socket.on('new-settings', function(photos) {
            $scope.photos = photos;
        });
        
        socket.emit('load-settings');
    }
]);