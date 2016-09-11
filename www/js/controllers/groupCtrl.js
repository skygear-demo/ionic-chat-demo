angular.module('app.controllers.groupCtrl', [])

.controller('groupCtrl', [
  '$scope', 'SkygearChat', 'Skygear', '$ionicModal', '$ionicScrollDelegate',
  'conversation', 'Messages', 'Users', 'Conversations', '$ionicLoading',
  function($scope, SkygearChat, Skygear, $ionicModal, $ionicScrollDelegate,
            conversation, Messages, Users, Conversations, $ionicLoading) {
    $scope.conversation = conversation;
    $scope.conversationId = conversation._id;
    $scope.conversations = Messages.conversations;
    $scope.currentUser = Skygear.currentUser;
    $scope.users = Users.users;

    $scope.showInviteUserModal = function() {
      $scope.modal.show();
    };

    $scope.selectUser = function(user) {
      $ionicLoading.show({
        template: 'Adding user to this group...'
      });
      Conversations.addParticipant($scope.conversationId, user._id)
      .then(function() {
        $ionicLoading.hide();
        $scope.modal.hide();
      });
    };

    $scope.sendMessage = function(message) {
      if (message) {
        Messages.createMessage($scope.conversationId, message);
        $scope.message = "";
        $ionicScrollDelegate.scrollBottom();
      }
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $ionicModal.fromTemplateUrl('templates/userSelector.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $scope.$on('modal.shown', function() {
      var userIdExists = $scope.conversation.participant_ids
      .concat([Skygear.currentUser.id]);
      Users.fetchAllUsersExclude(userIdExists)
      .then(function(users) {
        $scope.inviteUsers = users;
        $scope.$apply();
      });
    });

    Messages.fetchMessages($scope.conversationId)
    .then(function() {
      $ionicScrollDelegate.scrollBottom();
    });
  }
]);
