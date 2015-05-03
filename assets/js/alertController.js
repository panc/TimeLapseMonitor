'use strict';

angular.module('tlm')
.controller('alertController', [
    '$scope', '$timeout', 'socket', function($scope, $timeout, socket) {
        
        $scope.alerts = [];

        socket.on('log-message', function(message) {
            var alert = {
                type: 'success', 
                msg: message
            };

            $scope.alerts.push(alert);
            
            $timeout(function() {
                var index = $scope.alerts.indexOf(alert);
                $scope.closeAlert(index);
            }, 5000);
        });

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
    }
]);