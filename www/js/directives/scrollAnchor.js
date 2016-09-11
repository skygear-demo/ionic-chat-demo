angular.module('app.directives.scrollAnchor', [])

.directive('scrollAnchor', ['$ionicScrollDelegate', '$window',
  function($ionicScrollDelegate, $window) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        // Detecting whether the list view of the ion-content
        // is showing the bottom of the last message.
        element.on('scroll', ionic.throttle(function() {
          const content = element.find('ion-list');
          const list = content.children()[0];

          const scrollPosition = $ionicScrollDelegate.getScrollPosition();
          const height = element[0].clientHeight;

          if (scrollPosition.top + height >= list.clientHeight) {
            scope.anchorBottom = true;
          } else {
            scope.anchorBottom = false;
          }
        }, 500, {leading: false}));

        // anchor view bottom when keyboard shows and hides.
        $window.addEventListener('native.keyboardshow', function(event) {
          if (scope.anchorBottom) {
            $ionicScrollDelegate.scrollBottom();
          } else {
            scope.keyboardHeight = event.keyboardHeight - 50;
            const scrollTop = $ionicScrollDelegate.getScrollPosition().top;
            $ionicScrollDelegate.scrollTo(0, scrollTop + scope.keyboardHeight);
          }
        });

        $window.addEventListener('native.keyboardhide', function(event) {
          if (scope.anchorBottom) {
            $ionicScrollDelegate.scrollBottom();
          } else {
            const scrollTop = $ionicScrollDelegate.getScrollPosition().top;
            $ionicScrollDelegate.scrollTo(0, scrollTop - scope.keyboardHeight);
          }
        });

        // When user is looking at the latest message, the list view will
        // be auto scrolled to bottom. Otherwise, the list will not scroll
        // automatically.
        scope.$on('new-message-received', function() {
          if (scope.anchorBottom) {
            $ionicScrollDelegate.scrollBottom();
          }
        });
      }
    };
  }
]);
