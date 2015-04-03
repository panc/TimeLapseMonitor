'use strict';

angular.module('tlm')
.controller('homeController', [
    '$scope', 'socket', function($scope, socket) {

        socket.on('pong', function (data) {
            //console.log("pong");
            alert('Pont');
        });

        $scope.sendPing = function() {
            alert('ping');
            socket.emit('ping', { duration: 2 });
        }

         //$scope.images = sailsResource('image').query();;

    }
]);