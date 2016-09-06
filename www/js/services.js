angular.module('app.services', [])

.factory('Conversations', ['SkygearChat', '$q', function (SkygearChat, $q) {
  var conversations = {};

  return {
    cache: function (conversation) {
      conversations[conversation._id] = conversation;
    },
    get: function (conversationId) {
      var deferred = $q.defer();
      if (!conversations[conversationId]) {
        return SkygearChat.getConversation(conversationId)
        .then(function (conversation) {
          conversations[conversation._id] = conversation;
          deferred.resolve(conversation);
        });
      } else {
        deferred.resolve(conversations[conversationId]);
      }
      return deferred.promise;
    },
  };
}])

.factory('Users', ['Skygear', '$q', function (Skygear, $q) {
  var users = {};
  var User = Skygear.Record.extend('user');


  return {
    cache: function (user) {
      users[user._id] = user;
    },
    exists: function (userId) {
      return !!users[userId];
    },
    get: function (userId) {
      var deferred = $q.defer();
      if (!users[userId]) {
        var query = new Skygear.Query(User).equalTo('_id', userId);
        return Skygear.publicDB.query(query)
        .then(function (results) {
          users[userId] = results[0];
          deferred.resolve(results[0]);
        });
      } else {
        deferred.resolve(users[userId]);
      }
      return deferred.promise;
    }
  };
}])

.service('Skygear', ['$window', function($window) {
  // Expose global skygear to dependency injectable object in angular
  return $window.skygear;
}])

.service('SkygearChat', ['$window', function($window) {
  // Expose global skygear chat to dependency injectable object in angular
  return $window.skygear_chat;
}])

.service('BlankService', [function(){

}]);