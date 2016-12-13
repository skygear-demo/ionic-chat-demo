angular.module('app.controllers.chatCtrl', [])

/**
 * chatCtrl controller simply handle send messages
 */
.controller('chatCtrl', [
  '$scope', 'Skygear', '$ionicScrollDelegate', 'user', 'conversation',
  'Messages', 'Typing',
  function($scope, Skygear, $ionicScrollDelegate, user, conversation,
            Messages, Typing) {
    // Fetch all messages of this direct conversation and
    // bind it to our view
    Messages.fetchMessages(conversation)
    .then(function() {
      $ionicScrollDelegate.scrollBottom();
    });
    $scope.conversations = Messages.conversations;
    $scope.conversationId = conversation.id;
    $scope.currentUser = Skygear.currentUser;
    $scope.user = user;
    $scope.typingUsers = Typing.getByConversation(conversation.id);

    $scope.sendMessage = function(messageText) {
      if (messageText) {
        Messages.createMessage(conversation, messageText);
        $scope.message = "";
        $ionicScrollDelegate.scrollBottom();
      }
    };

    $scope.$watch('message', function (newValue, oldValue) {
      if (newValue) {
        Typing.begin(conversation);
      } else {
        Typing.finished(conversation);
      };
    });

    $scope.$on("$destroy", function() {
      Typing.finished(conversation);
    });
  }
]);
