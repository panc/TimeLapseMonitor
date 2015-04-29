'use strict';

angular.module('tlm')
.controller('homeController', [
    '$scope', 'socket', function($scope, socket) {

        $scope.refresh = function() {
            socket.emit('refresh-photos');
        }
        
        $scope.takePhoto = function () {
            socket.emit('take-photo');
        }

        socket.on('new-photos', function(photos) {
            $scope.photos = photos;
        });

        $scope.refresh();
    }
]);