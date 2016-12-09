angular.module('app.controllers.chatsCtrl', [])

/**
 * chatsCtrl controller able to create a new direct conversation
 * and navigate to a direct conversation.
 */
.controller('chatsCtrl', [
  '$scope', 'Skygear', '$ionicModal', '$state',
  'Conversations', 'Users', '$ionicLoading',
  function($scope, Skygear, $ionicModal, $state,
            Conversations, Users, $ionicLoading) {
    console.log('chatsCtrl');
    // Fetch all conversation and establish a linkage to the view
    Conversations.fetchConversations();
    $scope.conversations = Conversations.conversations;
    $scope.users = Users.users;

    // Create a modal to select user to create a new direct conversation
    $ionicModal.fromTemplateUrl('templates/userSelector.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // When a user is selected from the above modal, we will navigate
    // to that conversation immediately after successful creation.
    $scope.selectUser = function(user) {
      $ionicLoading.show({
        template: 'Creating direct conversation...'
      });
      Conversations.createDirectConversation(user, user.name)
        .then(function(userConversation) {
          $ionicLoading.hide();
          $scope.modal.hide();
          $state.go('tabsController.chat', {
            id: userConversation.$transient.conversation._id
          });
        });
    };

    $scope.createDirectConversation = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    // Fetch all users who are not participating direct conversation
    // with current user
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

    // Navigate to the conversation
    $scope.goToChat = function(conversationId) {
      $state.go('tabsController.chat', {
        id: conversationId
      });
      Conversations.setUnreadCount(conversationId, 0);
    };
  }
]);
