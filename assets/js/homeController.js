'use strict';

angular.module('tlm')
.controller('homeController', [
    '$scope', 'socket', function($scope, socket) {

        $scope.refresh = function() {
            socket.emit('refresh');
        }
        
        $scope.takePhoto = function () {
            socket.emit('takePhoto');
        }

        socket.on('new-photos', function(photos) {
            $scope.photos = photos;
        });

        $scope.refresh();
    }
]);