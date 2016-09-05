angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('tabsController.groups', {
    url: '/group',
    views: {
      tab1: {
        templateUrl: 'templates/groups.html',
        controller: 'groupsCtrl'
      }
    }
  })

  .state('tabsController.chats', {
    url: '/chat',
    views: {
      tab2: {
        templateUrl: 'templates/chats.html',
        controller: 'chatsCtrl'
      }
    }
  })

  .state('tabsController.settings', {
    url: '/settings',
    views: {
      tab3: {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/app',
    templateUrl: 'templates/tabsController.html',
    abstract: true
  })

  .state('tabsController.group', {
    url: '/group/:id',
    views: {
      tab1: {
        templateUrl: 'templates/group.html',
        controller: 'groupCtrl',
        resolve: {
          conversation: function($stateParams, Conversations) {
            const conversationId = $stateParams.id;
            return Conversations.fetchConversation(conversationId);
          }
        }
      }
    }
  })

  .state('tabsController.chat', {
    url: '/chat/:id',
    views: {
      tab2: {
        templateUrl: 'templates/chat.html',
        controller: 'chatCtrl',
        resolve: {
          user: function($stateParams, conversation, Users, Skygear) {
            var otherUserId = conversation.participant_ids.filter(function(p) {
              return p !== Skygear.currentUser.id;
            })[0];
            return Users.fetchUser(otherUserId);
          },
          conversation: function($stateParams, Conversations) {
            var conversationId = $stateParams.id;
            return Conversations.fetchConversation(conversationId);
          }
        }
      }
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('userSelector', {
    url: '/user-selector',
    templateUrl: 'templates/userSelector.html',
    controller: 'userSelectorCtrl'
  });

  $urlRouterProvider.otherwise('/login');
});
