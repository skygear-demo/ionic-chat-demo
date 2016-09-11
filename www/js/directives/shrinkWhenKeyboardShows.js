angular.module('app.directives.shrinkWhenKeyboardShows', [])

// shrink view when keyboard shows to avoid overlapping of input box
// by software keyboard.
.directive('shrinkWhenKeyboardShows', ['$window', '$ionicScrollDelegate',
  function($window, $ionicScrollDelegate) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        $window.addEventListener('native.keyboardshow', function(event) {
          scope.keyboardHeight = event.keyboardHeight - 50;
          element.css('height', 'calc(100% - ' + scope.keyboardHeight + 'px)');
        });
        $window.addEventListener('native.keyboardhide', function(event) {
          element.css('height', '');
        });
      }
    };
  }
]);
