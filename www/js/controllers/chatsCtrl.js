angular.module('app.controllers.chatsCtrl', [])

.controller('chatsCtrl', [
  '$scope', 'Skygear', '$ionicModal', '$state',
  'Conversations', 'Users', '$ionicLoading',
  function($scope, Skygear, $ionicModal, $state,
            Conversations, Users, $ionicLoading) {
    $scope.conversations = Conversations.conversations;
    $scope.users = Users.users;

    $ionicModal.fromTemplateUrl('templates/userSelector.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.createDirectConversation = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.goToChat = function(conversationId) {
      $state.go('tabsController.chat', {
        id: conversationId
      });
      Conversations.setUnreadCount(conversationId, 0);
    };

    $scope.selectUser = function(user) {
      $ionicLoading.show({
        template: 'Creating direct conversation...'
      });
      Conversations.createDirectConversation(user._id)
      .then(function(userConversation) {
        $ionicLoading.hide();
        $scope.modal.hide();
        $state.go('tabsController.chat', {
          id: userConversation.$transient.conversation._id
        });
      });
    };

    $scope.$on('modal.shown', function() {
      var userIdExists = $scope.conversations.directConversations
      .map(function(userConversation) {
        return userConversation.$transient.conversation.participant_ids
        .filter(function(p) {
          return p !== Skygear.currentUser.id;
        })[0];
      }).concat(Skygear.currentUser.id);
      Users.fetchAllUsersExclude(userIdExists)
      .then(function(users) {
        $scope.inviteUsers = users;
        $scope.$apply();
      });
    });

    Conversations.fetchConversations();
  }
]);
