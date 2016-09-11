angular.module('app', [
  'ionic', 'app.controllers', 'app.routes', 'app.directives', 'app.services'
])

.run(function($ionicPlatform, Skygear, $state, Conversations,
              SkygearChatEvent) {
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

    if (Skygear.currentUser) {
      Conversations.fetchConversations()
      .then(function() {
        $state.go('tabsController.groups');
      });
      SkygearChatEvent.subscribe();
    }
  });
});

// Config skygear with api end point and api key before angular bootstrapping
// to ensure all components in angular work with skygear
skygear.config({
  endPoint: 'https://ionichat1.skygeario.com/',
  apiKey: '1f9716a3c7c64ac39c03cfd6f911a5cf'
}).then(function(client) {
  console.log('Skygear config success', client);
  angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
  });
});
