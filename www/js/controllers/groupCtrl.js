angular.module('app.controllers.groupCtrl', [])

/**
 * groupCtrl controller
 */
.controller('groupCtrl', [
  '$scope', 'SkygearChat', 'Skygear', '$ionicModal', '$ionicScrollDelegate',
  'conversation', 'Messages', 'Users', 'Conversations', '$ionicLoading',
  function($scope, SkygearChat, Skygear, $ionicModal, $ionicScrollDelegate,
           conversation, Messages, Users, Conversations, $ionicLoading) {
    // Bind message cached to the view
    Messages.fetchMessages(conversation)
    .then(function() {
      $ionicScrollDelegate.scrollBottom();
    });
    $scope.conversations = Messages.conversations;

    $scope.conversation = conversation;
    $scope.conversationId = conversation._id;
    $scope.currentUser = Skygear.currentUser;
    $scope.users = Users.users;

    $scope.sendMessage = function(messageText) {
      if (messageText) {
        Messages.createMessage($scope.conversation, messageText);
        $scope.message = "";
        $ionicScrollDelegate.scrollBottom();
      }
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    // Create an invite user modal and shows users.
    // When user selected a user on the list, we will ask skygear chat
    // plugin to add this user as a participant of this chat
    $ionicModal.fromTemplateUrl('templates/userSelector.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.showInviteUserModal = function() {
      $scope.modal.show();
    };

    $scope.selectUser = function(user) {
      $ionicLoading.show({
        template: 'Adding user to this group...'
      });
      Conversations.addParticipant($scope.conversation, user)
      .then(function() {
        $ionicLoading.hide();
        $scope.modal.hide();
      });
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    // Fetch all users who are not belonging to this group
    // and display in the invite user modal
    $scope.$on('modal.shown', function() {
      var userIdExists = $scope.conversation.participant_ids
      .concat([Skygear.currentUser.id]);
      Users.fetchAllUsersExclude(userIdExists)
      .then(function(users) {
        $scope.inviteUsers = users;
        $scope.$apply();
      });
    });
  }
]);
