'use strict';

angular.module('tlm')
.controller('settingsController', [
    '$scope', 'socket', function($scope, socket) {
        
        $scope.settings = { };

        $scope.save = function () {
            var settings = {
                numberOfPhotos: $scope.settings.numberOfPhotos,
                timeLapseInterval: $scope.settings.timeLapseInterval * 1000
            }

            socket.emit('update-settings', settings);
        }
        
        socket.on('new-settings', function(settings) {
            $scope.settings = {
                numberOfPhotos: settings.numberOfPhotos,
                timeLapseInterval: settings.timeLapseInterval / 1000
            };
        });
        
        socket.emit('request-settings');
    }
]);