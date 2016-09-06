angular.module('app.controllers', [])
  
.controller('groupsCtrl', ['$scope', '$stateParams', 'Skygear', 'SkygearChat',
  '$q', '$ionicPopup', '$state', 'Conversations',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Skygear, SkygearChat, $q, $ionicPopup, $state, Conversations) {
  $scope.groups = [];
  $scope.newGroup = {};

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
      return SkygearChat.createConversation(
        [Skygear.currentUser.id], [Skygear.currentUser.id], res);
    }).then(function (conversation) {
      Conversations.cache(conversation);
      console.log('Create group conversation success', conversation);
      $scope.groups = $scope.groups.concat([conversation]);
      $state.go('tabsController.group', {id: conversation._id});
    });
  };

  var getConversations = function () {
    SkygearChat.getConversations()
    .then(function (conversations) {
      console.log('Get Conversations success', conversations);
      conversations.forEach(function (conversation) {
        Conversations.cache(conversation);
      });
      $scope.groups = conversations.filter(function (conversation) {
        return !conversation.is_direct_message;
      });
      $scope.$apply();
    }, function (error) {
      console.log('Get conversations error', error);
      $scope.groups = [];
      $scope.$apply();
    });
  };

  // Get conversations when groups page loads or receiving chat events
  getConversations();
  SkygearChat.subscribe(function (data) {
    if (data.record_type === 'conversation') {
      getConversations();
    }
  });
}])
   
.controller('chatsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


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
      
.controller('groupCtrl', ['$scope', '$stateParams', 'SkygearChat', 'Skygear', '$ionicModal', '$ionicScrollDelegate', 'conversation', 'Users', '$q',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, SkygearChat, Skygear, $ionicModal, $ionicScrollDelegate, conversation, Users, $q) {
  var conversationId = $stateParams.id;
  $scope.conversation = conversation;

  $scope.messages = [];
  $scope.users = [];

  var getMessages = function () {
    return SkygearChat.getMessages(conversationId)
    .then(function (messages) {
      return $q.all(messages.results.map(function (c) {
        return Users.get(c._created_by).then(function (user) {
          c.user = user;
          c.byMe = c._created_by === Skygear.currentUser.id;
          return c;
        });
      })).then(function (messages) {
        console.log('Get messages success', messages);
        $scope.messages = messages.reverse();
      }, function (error) {
        console.log(error);
      });
    }, function (error) {
      console.log('Get messages error', error.error.message);
    });
  };

  $scope.showInviteUserModal = function () {
    $scope.modal.show();
  };

  $scope.selectUser = function (user) {
    SkygearChat.addParticipants(conversationId, [user._id])
    .then(function (data) {
      console.log('Add participants success', data);
    }, function (error) {
      console.log('Add participants error', error);
    });
    $scope.modal.hide();
  };

  $scope.sendMessage = function (message) {
    SkygearChat.createMessage(conversationId, message)
    .then(function (message) {
      console.log('Create message success', message);
      $scope.message = "";
    }, function (error) {
      console.log('Create message error', error);
    });
  };

  $ionicModal.fromTemplateUrl('../templates/userSelector.html', {
    scope: $scope,
    animation: 'slide-in-up',
  }).then(function (modal) {
    $scope.modal = modal;
  });

  getMessages().then(function () {
    $ionicScrollDelegate.scrollBottom();
  });

  SkygearChat.subscribe(function (data) {
    console.log(data);
    if (data.event_type === 'create' && data.record.conversation_id.$id.indexOf(conversationId) !== -1) {
      getMessages().then(function () {
        if (data.record._created_by === Skygear.currentUser.id) {
          $ionicScrollDelegate.scrollBottom();
        }
      });
    }
  });

  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });

  $scope.$on('modal.shown', function () {
    var User = Skygear.Record.extend('user');
    var q = new Skygear.Query(User)
      .notContains('_id', $scope.conversation.participant_ids.concat(
        [Skygear.currentUser.id]));
    Skygear.publicDB.query(q)
    .then(function (users) {
      console.log('Get user success', users);
      $scope.users = users;
      $scope.$apply();
    }, function (error) {
      console.log('Get user error', error);
    });
  });
}])
   
.controller('chatCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
   
.controller('loginCtrl', ['$scope', '$stateParams', 'Skygear', '$state',
// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, Skygear, $state) {
  $scope.login = function (username, password) {
    if (!username || !password) {
      alert('Missing Username or Password');
      return;
    }

    Skygear.loginWithUsername(username, password)
    .then(function (user) {
      console.log('Login success', user);
      $state.go('tabsController.groups');
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
 