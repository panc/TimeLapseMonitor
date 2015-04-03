'use strict';

angular.module('tlm')
.controller('homeController', [
    '$scope', 'socket', function($scope, socket) {


        socket.on('pong', function (data) {
            //console.log("pong");
            alert('Pont');
        });

        $scope.refresh = function() {
            socket.emit('refresh');
        }

        socket.on('new-items', function(items) {
            $scope.images = items;
        });
    }
]);