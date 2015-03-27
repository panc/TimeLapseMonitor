'use strict';

angular.module('tlm')
.controller('homeController', [
    '$scope', '$state', 'sailsResource', function($scope, $state, sailsResource) {

         $scope.images = sailsResource('image').query();;

    }
]);