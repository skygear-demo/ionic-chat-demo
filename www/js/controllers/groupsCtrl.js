angular.module('app.controllers.groupsCtrl', [])

/**
 * GroupsCtrl controller binds create group and enter group conversation.
 */
.controller('groupsCtrl', [
  '$scope', '$ionicPopup', '$state', 'Conversations',
  '$ionicLoading',
  function($scope, $ionicPopup, $state, Conversations,
           $ionicLoading) {
    // Bind conversation cache to the view
    Conversations.fetchConversations();
    $scope.conversations = Conversations.conversations;

    // Create a popup for creating a group.
    // We simply prompt user for group name and let skygear
    // create a new group for us. We will go to the newly created
    // group conversation when the new group is successfully created.
    $scope.newGroup = {};
    var popupData = {
      template: '<input type="text" ng-model="newGroup.name">',
      title: 'Create new group',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      }, {
        text: 'Create',
        type: 'button-positive',
        onTap: function(event) {
          if (!$scope.newGroup.name) {
            event.preventDefault();
          } else {
            return $scope.newGroup.name;
          }
        }
      }]
    };

    $scope.createGroup = function() {
      $ionicPopup.show(popupData)
      .then(function(res) {
        if (res) {
          $ionicLoading.show({
            template: 'Creating Group...'
          });
          return Conversations.createGroupConversation(res);
        }
      }).then(function(_conversation) {
        if (_conversation) {
          $ionicLoading.hide();
          $scope.newGroup.name = "";
          $state.go('tabsController.group', {
            id: _conversation._id
          });
        }
      });
    };

    // Transition to the group conversation.
    // At the same time, we will set the unread count of the viewing
    // conversation to 0 to reflect all messages are read.
    $scope.goToGroup = function(conversationId) {
      $state.go('tabsController.group', {id: conversationId});
      Conversations.setUnreadCount(conversationId, 0);
    };
  }
]);
