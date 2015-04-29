'use strict';

angular.module('tlm')
.controller('settingsController', [
    '$scope', 'socket', function($scope, socket) {
        
        $scope.settings = { };

        $scope.save = function () {
            console.log("settings: ", $scope.settings.numberOfPhotos);
            socket.emit('update-settings', $scope.settings);
        }
        
        socket.on('new-settings', function(settings) {
            $scope.settings = settings;
        });
        
        socket.emit('request-settings');
    }
]);