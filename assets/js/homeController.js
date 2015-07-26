'use strict';

angular.module('tlm')
.controller('homeController', [
    '$scope', 'socket', function($scope, socket) {

        $scope.showPreview = false;

        $scope.refresh = function() {
            socket.emit('refresh-photos');
            // todo: disable button
        };

        $scope.takePhoto = function() {
            socket.emit('take-photo');
            // todo: disable button
        };

        $scope.startOrStopTimeplase = function() {
            var method = $scope.isTimelapseRunning ? 'stop-timelapse' : 'start-timelapse';
            socket.emit(method);
            // todo: disable button
        };

        $scope.startOrStopPreview = function () {
            var method = $scope.isStreaming ? 'stop-stream' : 'start-stream';
            socket.emit(method);
            // todo: disable button
        };

        socket.on('new-photos', function(photos) {
            $scope.photos = photos;
        });
        
        socket.on('timelapse-state-changed', function (isTimelapseRunning) {
            mapTimelapseState(isTimelapseRunning);
        });
        
        socket.on('stream-data-changed', function (image) {
            $scope.streamSource = image;
        });
        
        socket.emit('request-timelapse-state', function (state) {
            mapTimelapseState(state);
        });

        var mapTimelapseState = function (state) {
            $scope.isTimelapseRunning = state.isTimelapseRunning;
            $scope.isStreaming = state.isStreaming;

            if (state.isTimelapseRunning)
                $scope.timelapseState = "Running";
            else if (state.isStreaming)
                $scope.timelapseState = "Preview";
            else
                $scope.timelapseState = "Stopped";
            
            $scope.startStopButtonText = state.isTimelapseRunning ? "Stop Timelapse" : "Start Timelapse";
            $scope.startOrStopPreviewText = state.isStreaming ? "Stop Preview" : "Start Preview";
        };

        $scope.refresh();
    }
]);