angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('Skygear', ['$window', function($window) {
  // Expose global skygear to dependency injectable object in angular
  return $window.skygear;
}])

.service('SkygearChat', ['$window', function($window) {
  // Expose global skygear chat to dependency injectable object in angular
  return $window.skygear_chat;
}])

.service('BlankService', [function(){

}]);