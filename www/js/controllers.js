angular.module('app.controllers', [])
  
.controller('groupsCtrl', ['$scope', '$stateParams', 'Skygear', 'SkygearChat',
  '$q', '$ionicPopup', '$state', 'Conversations', 'SkygearChatEvent',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Skygear, SkygearChat, $q, $ionicPopup, $state, Conversations, SkygearChatEvent) {
  $scope.newGroup = {};
  $scope.conversations = Conversations.conversations;
  console.log($scope.conversations);

  // Create a popup for creating a group
  var popupData = {
    template: '<input type="text" ng-model="newGroup.name" placeholder="Group Name">',
    title: 'Create new group',
    scope: $scope,
    buttons: [{
      text: 'Cancel'
    }, {
      text: 'Create',
      type: 'button-positive',
      onTap: function (event) {
        if (!$scope.newGroup.name) {
          e.preventDefault();
        } else {
          return $scope.newGroup.name;
        }
      }
    }]
  };

  $scope.createGroup = function () {
    $ionicPopup.show(popupData)
    .then(function (res) {
      return Conversations.createGroupConversation(res);
    }).then(function (userConversation) {
      $state.go('tabsController.group', {id: userConversation.$transient.conversation._id});
    });
  };

  $scope.goToGroup = function (conversationId) {
    $state.go('tabsController.group', {id: conversationId});
    Conversations.setUnreadCount(conversationId, 0);
  };

  Conversations.fetchConversations();

  SkygearChatEvent.subscribe();
}])
   
.controller('chatsCtrl', ['$scope', '$stateParams', 'SkygearChat', 'Skygear', '$ionicModal', '$state', '$q', 'Conversations', 'Users', 'SkygearChatEvent',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, SkygearChat, Skygear, $ionicModal, $state, $q, Conversations, Users, SkygearChatEvent) {
  $scope.conversations = Conversations.conversations;
  $scope.users = Users.users;

  $ionicModal.fromTemplateUrl('templates/userSelector.html', {
    scope: $scope,
    animation: 'slide-in-up',
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.createDirectConversation = function () {
    $scope.modal.show();
  };

  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  $scope.goToChat = function (conversationId) {
    $state.go('tabsController.chat', {
      id: conversationId
    });
    Conversations.setUnreadCount(conversationId, 0);
  };
  
  $scope.selectUser = function (user) {
    Conversations.createDirectConversation(user._id)
    .then(function (userConversation) {
      $scope.modal.hide();
      $state.go('tabsController.chat', {
        id: userConversation.$transient.conversation._id
      });
    });
  };

  $scope.$on('modal.shown', function () {
    var userIdExists = $scope.conversations.directConversations
    .map(function (userConversation) {
      return userConversation.$transient.conversation.participant_ids.filter(function (p) {
        return p !== Skygear.currentUser.id;
      })[0];
    }).concat(Skygear.currentUser.id);
    Users.fetchAllUsersExclude(userIdExists)
    .then(function (users) {
      $scope.inviteUsers = users;
      $scope.$apply();
    });
  });

  Conversations.fetchConversations();

  SkygearChatEvent.subscribe();
}])
   
.controller('settingsCtrl', ['$scope', '$stateParams', 'Skygear', '$state',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Skygear, $state) {
  $scope.logout = function () {
    Skygear.logout().then(function () {
      $state.go('login');
    });
  };
}])
      
.controller('groupCtrl', ['$scope', '$stateParams', 'SkygearChat', 'Skygear', '$ionicModal', '$ionicScrollDelegate', 'conversation', 'Users', '$q', 'Messages', 'Users', 'Conversations', 'SkygearChatEvent',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, SkygearChat, Skygear, $ionicModal, $ionicScrollDelegate, conversation, Users, $q, Messages, Users, Conversations, SkygearChatEvent) {
  $scope.conversation = conversation;
  $scope.conversationId = conversation._id;
  $scope.conversations = Messages.conversations;
  $scope.currentUser = Skygear.currentUser;
  $scope.users = Users.users;

  $scope.showInviteUserModal = function () {
    $scope.modal.show();
  };

  $scope.selectUser = function (user) {
    Conversations.addParticipant($scope.conversationId, user._id);
    $scope.modal.hide();
  };

  $scope.sendMessage = function (message) {
    var action = Messages.createMessage($scope.conversationId, message);
    $scope.message = "";
    $ionicScrollDelegate.scrollBottom();
  };

  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  $ionicModal.fromTemplateUrl('templates/userSelector.html', {
    scope: $scope,
    animation: 'slide-in-up',
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });

  $scope.$on('modal.shown', function () {
    var userIdExists = $scope.conversation.participant_ids
    .concat([Skygear.currentUser.id]);
    Users.fetchAllUsersExclude(userIdExists)
    .then(function (users) {
      $scope.inviteUsers = users;
      $scope.$apply();
    });
  });

  Messages.fetchMessages($scope.conversationId)
  .then(function () {
    $ionicScrollDelegate.scrollBottom();
  });

  SkygearChatEvent.subscribe();
}])
   
.controller('chatCtrl', ['$scope', '$stateParams', 'Skygear', 'SkygearChat', '$ionicScrollDelegate', 'user', 'conversation', 'Messages', 'SkygearChatEvent',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Skygear, SkygearChat, $ionicScrollDelegate, user, conversation, Messages, SkygearChatEvent) {
  $scope.conversations = Messages.conversations;
  $scope.conversationId = conversation._id;
  $scope.currentUser = Skygear.currentUser;
  $scope.user = user;

  $scope.sendMessage = function (message) {
    Messages.createMessage(conversation._id, message);
    $scope.message = "";
    $ionicScrollDelegate.scrollBottom();
  };

  Messages.fetchMessages($scope.conversationId)
  .then(function () {
    $ionicScrollDelegate.scrollBottom();
  });

  SkygearChatEvent.subscribe();
}])
   
.controller('loginCtrl', ['$scope', '$stateParams', 'Skygear', '$state', 'Conversations',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Skygear, $state, Conversations) {
  $scope.login = function (username, password) {
    if (!username || !password) {
      alert('Missing Username or Password');
      return;
    }

    Skygear.loginWithUsername(username, password)
    .then(function (user) {
      console.log('Login success', user);
      Conversations.fetchConversations()
      .then(function () {
        $state.go('tabsController.groups');
      });
    }, function (error) {
      console.log('Login error', error);
      alert(error.error.message);
    });
  };

}])
   
.controller('signupCtrl', ['$scope', '$stateParams', 'Skygear', '$state',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Skygear, $state) {
  var User = Skygear.Record.extend('user');

  $scope.signup = function (name, username, password) {
    if (!name || !username || !password) {
      alert('Missing Name, Username or Password');
      return;
    }

    Skygear.signupWithUsername(username, password)
    .then(function (user) {
      console.log('Signup success', user);

      // Save display name of the user to user record
      var userProfile = new User({
        '_id': 'user/' + Skygear.currentUser.id,
        'name': name,
      });
      Skygear.publicDB.save(userProfile).then(function (profile) {
        console.log('Save profile success', profile);
        $state.go('tabsController.groups');
      }, function (error) {
        console.log('Save profile error', error);
        alert(error.error.message);
      });
    }, function (error) {
      console.log('Signup error', error);
      alert(error.error.message);
    });
  };

}])
   
.controller('userSelectorCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
 