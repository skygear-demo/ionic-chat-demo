angular.module('app', [
  'ionic', 'app.controllers', 'app.routes', 'app.directives', 'app.services'
])

.run(function($ionicPlatform, Skygear, $state, Conversations,
              SkygearChatEvent, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the
    // accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins &&
      window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      window.StatusBar.styleDefault();
    }

    // currentUser exists in Skygear SDK when user successfully logged in
    // using Skygear SDK. We check the existance of this attribute and
    // go to groups page directly.
    if (Skygear.auth.currentUser) {
      Conversations.fetchConversations();
      $timeout(function() {
        $state.go('tabsController.groups');
        SkygearChatEvent.subscribe();
      });
    }
  });
});

// Config skygear with api end point and api key before angular bootstrapping
// to ensure all components in angular work with skygear
skygear.config({
  endPoint: '<< Your Skygear End Point >>',
  apiKey: '<< Your API Key >>'
}).then(function(client) {
  console.log('Skygear config success', client);
  angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
  });
});
