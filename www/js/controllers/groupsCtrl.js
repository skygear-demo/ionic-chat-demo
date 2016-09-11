angular.module('app.controllers.groupsCtrl', [])

.controller('groupsCtrl', [
  '$scope', '$ionicPopup', '$state', 'Conversations',
  '$ionicLoading',
  function($scope, $ionicPopup, $state, Conversations,
           $ionicLoading) {
    $scope.newGroup = {};
    $scope.conversations = Conversations.conversations;

    // Create a popup for creating a group
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
        $ionicLoading.show({
          template: 'Creating Group...'
        });
        return Conversations.createGroupConversation(res);
      }).then(function(userConversation) {
        $ionicLoading.hide();
        $scope.newGroup.name = "";
        $state.go('tabsController.group', {
          id: userConversation.$transient.conversation._id
        });
      });
    };

    $scope.goToGroup = function(conversationId) {
      $state.go('tabsController.group', {id: conversationId});
      Conversations.setUnreadCount(conversationId, 0);
    };

    Conversations.fetchConversations();
  }
]);
