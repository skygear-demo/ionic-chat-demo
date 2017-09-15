angular.module('app.controllers.loginCtrl', [])

.controller('loginCtrl', [
  '$scope', 'Skygear', '$state', 'Conversations', '$ionicLoading',
  'SkygearChatEvent',
  function($scope, Skygear, $state, Conversations, $ionicLoading,
           SkygearChatEvent) {
    $scope.login = function(username, password) {
      if (!username || !password) {
        alert('Missing Username or Password');
        return;
      }

      $ionicLoading.show({
        template: 'Logging in...'
      });

      Skygear.auth.loginWithUsername(username, password)
      .then(function(user) {
        console.log('Login success', user);
        Conversations.fetchConversations()
        .then(function() {
          $ionicLoading.hide();
          $state.go('tabsController.groups');
          SkygearChatEvent.subscribe();
        });
      }, function(error) {
        $ionicLoading.hide();
        console.log('Login error', error);
        alert(error.error.message);
      });
    };
  }
]);
