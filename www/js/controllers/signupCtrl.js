angular.module('app.controllers.signupCtrl', [])

.controller('signupCtrl', [
  '$scope', 'Skygear', '$state', '$ionicLoading',
  function($scope, Skygear, $state, $ionicLoading) {
    var User = Skygear.Record.extend('user');

    $scope.signup = function(name, username, password) {
      if (!name || !username || !password) {
        alert('Missing Name, Username or Password');
        return;
      }

      $ionicLoading.show({
        template: 'Signing up...'
      });

      Skygear.auth.signupWithUsername(username, password, {
          name: name
      }).then(function(user) {
        console.log('Signup success', user);

        $ionicLoading.hide();
        $state.go('tabsController.groups');
      }, function(error) {
        console.log('Signup error', error);
        $ionicLoading.hide();
        alert(error.error.message);
      });
    };
  }
]);
