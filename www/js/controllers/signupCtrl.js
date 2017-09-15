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

      Skygear.auth.signupWithUsername(username, password)
      .then(function(user) {
        console.log('Signup success', user);

        // Save display name of the user to user record
        var userProfile = new User({
          _id: 'user/' + Skygear.auth.currentUser._id,
          name: name
        });
        Skygear.publicDB.save(userProfile).then(function(profile) {
          console.log('Save profile success', profile);
          $ionicLoading.hide();
          $state.go('tabsController.groups');
        }, function(error) {
          console.log('Save profile error', error);
          alert(error.error.message);
        });
      }, function(error) {
        console.log('Signup error', error);
        $ionicLoading.hide();
        alert(error.error.message);
      });
    };
  }
]);
