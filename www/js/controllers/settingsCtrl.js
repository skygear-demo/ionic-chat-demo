angular.module('app.controllers.settingsCtrl', [])

/**
 * settingsCtrl controller provide logout functionality
 */
.controller('settingsCtrl', ['$scope', 'Skygear', '$state',
  function($scope, Skygear, $state) {
    $scope.logout = function() {
      Skygear.logout().then(function() {
        $state.go('login');
      });
    };
  }
]);
