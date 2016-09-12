angular.module('app.controllers.chatCtrl', [])

/**
 * chatCtrl controller simply handle send messages
 */
.controller('chatCtrl', [
  '$scope', 'Skygear', '$ionicScrollDelegate', 'user', 'conversation',
  'Messages',
  function($scope, Skygear, $ionicScrollDelegate, user, conversation,
            Messages) {
    // Fetch all messages of this direct conversation and
    // bind it to our view
    Messages.fetchMessages(conversation._id)
    .then(function() {
      $ionicScrollDelegate.scrollBottom();
    });
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
  }
]);
