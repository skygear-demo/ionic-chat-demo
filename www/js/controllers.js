angular.module('app.controllers', [])

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
])

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
])

.controller('settingsCtrl', ['$scope', 'Skygear', '$state',
  function($scope, Skygear, $state) {
    $scope.logout = function() {
      Skygear.logout().then(function() {
        $state.go('login');
      });
    };
  }
])

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
])

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
])

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

      Skygear.loginWithUsername(username, password)
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
])

.controller('signupCtrl', [
  '$scope', 'Skygear', '$state', '$ionicLoading',
  function($scope, Skygear, $state, $ionicLoading) {
    var User = Skygear.Record.extend('user');

    $scope.signup = function(name, username, password) {
      if (!name || !username || !password) {
        alert('Missing Name, Username or Password');
        return;
      }

      $ionicLoading.show({
        template: 'Signing up...'
      });

      Skygear.signupWithUsername(username, password)
      .then(function(user) {
        console.log('Signup success', user);

        // Save display name of the user to user record
        var userProfile = new User({
          _id: 'user/' + Skygear.currentUser.id,
          name: name
        });
        Skygear.publicDB.save(userProfile).then(function(profile) {
          console.log('Save profile success', profile);
          $ionicLoading.hide();
          $state.go('tabsController.groups');
        }, function(error) {
          console.log('Save profile error', error);
          alert(error.error.message);
        });
      }, function(error) {
        console.log('Signup error', error);
        $ionicLoading.hide();
        alert(error.error.message);
      });
    };
  }
])

.controller('userSelectorCtrl', ['$scope', '$stateParams',
function($scope, $stateParams) {

}]);
