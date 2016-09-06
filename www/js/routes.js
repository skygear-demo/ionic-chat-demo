angular.module('app.routes', ['ionicUIRouter'])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.groups'
      2) Using $state.go programatically:
        $state.go('tabsController.groups');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /app/tab1/group
      /app/tab3/group
  */
  .state('tabsController.groups', {
    url: '/group',
    views: {
      'tab1': {
        templateUrl: 'templates/groups.html',
        controller: 'groupsCtrl'
      }
    }
  })

  .state('tabsController.chats', {
    url: '/chat',
    views: {
      'tab2': {
        templateUrl: 'templates/chats.html',
        controller: 'chatsCtrl'
      }
    }
  })

  .state('tabsController.settings', {
    url: '/settings',
    views: {
      'tab3': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/app',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  /* 
    The IonicUIRouter.js UI-Router Modification is being used for this route.
    To navigate to this route, do NOT use a URL. Instead use one of the following:
      1) Using the ui-sref HTML attribute:
        ui-sref='tabsController.group'
      2) Using $state.go programatically:
        $state.go('tabsController.group');
    This allows your app to figure out which Tab to open this page in on the fly.
    If you're setting a Tabs default page or modifying the .otherwise for your app and
    must use a URL, use one of the following:
      /app/tab1/group/1
      /app/tab3/group/1
  */
  .state('tabsController.group', {
    url: '/group/:id',
    views: {
      'tab1': {
        templateUrl: 'templates/group.html',
        controller: 'groupCtrl',
        resolve: {
          conversation: function ($stateParams, Conversations) {
            var conversationId = $stateParams.id;
            return Conversations.get(conversationId);
          },
        }
      }
    }
  })

  .state('tabsController.chat', {
    url: '/chat/1',
    views: {
      'tab2': {
        templateUrl: 'templates/chat.html',
        controller: 'chatCtrl'
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
  })

$urlRouterProvider.otherwise('/login')

  

});