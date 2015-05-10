'use strict';

angular.module('tlm')
.controller('homeController', [
    '$scope', 'socket', function($scope, socket) {

        $scope.refresh = function() {
            socket.emit('refresh-photos');

            // todo:
            // disable button
        }
        
        $scope.takePhoto = function () {
            socket.emit('take-photo');

            // todo:
            // disable button
        }
        
        $scope.startOrStopTimeplase = function () {
            var method = $scope.isTimelapseRunning ? 'start-timelapse' : 'stop-timelapse';
            socket.emit(method);

            // todo:
            // disable button
        }

        socket.on('new-photos', function(photos) {
            $scope.photos = photos;
        });
        
        socket.on('timelapse-state-changed', function (isTimelapseRunning) {
            mapTimelapseState(isTimelapseRunning);
        });
        
        socket.emit('request-timelapse-state', function (isTimelapseRunning) {
            mapTimelapseState(isTimelapseRunning);
        });

        var mapTimelapseState = function(isTimelapseRunning) {
            $scope.isTimelapseRunning = isTimelapseRunning;
            $scope.timelapseState = isTimelapseRunning ? "Running" : "Stopped";
            $scope.startStopButtonText = isTimelapseRunning ? "Stop Timelapse" : "Start Timelapse";
        };

        $scope.refresh();
    }
]);