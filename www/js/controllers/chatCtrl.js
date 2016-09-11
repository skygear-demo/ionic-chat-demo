angular.module('app.controllers.chatCtrl', [])

.controller('chatCtrl', [
  '$scope', 'Skygear', '$ionicScrollDelegate', 'user', 'conversation',
  'Messages',
  function($scope, Skygear, $ionicScrollDelegate, user, conversation,
            Messages) {
    $scope.conversations = Messages.conversations;
    $scope.conversationId = conversation._id;
    $scope.currentUser = Skygear.currentUser;
    $scope.user = user;

    $scope.sendMessage = function(message) {
      if (message) {
        Messages.createMessage(conversation._id, message);
        $scope.message = "";
        $ionicScrollDelegate.scrollBottom();
      }
    };

    Messages.fetchMessages($scope.conversationId)
    .then(function() {
      $ionicScrollDelegate.scrollBottom();
    });
  }
]);
