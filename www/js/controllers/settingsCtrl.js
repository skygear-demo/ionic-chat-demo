angular.module('app.controllers.settingsCtrl', [])

.controller('settingsCtrl', ['$scope', 'Skygear', '$state',
  function($scope, Skygear, $state) {
    $scope.logout = function() {
      Skygear.logout().then(function() {
        $state.go('login');
      });
    };
  }
]);
