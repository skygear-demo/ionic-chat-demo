angular.module('app.services.skygearChat', [])

.service('SkygearChat', ['$window',
  function($window) {
    return $window.skygear_chat;
  }
]);
