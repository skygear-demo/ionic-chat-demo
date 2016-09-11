angular.module('app.services.skygear', [])

.service('Skygear', ['$window',
  function($window) {
    return $window.skygear;
  }
]);
