angular.module('app.services.users', [])

.factory('Users', ['Skygear', '$q',
  function(Skygear, $q) {
    var users = {};
    var User = Skygear.Record.extend('user');

    return {
      users: users,

      fetchUser: function(userId) {
        var deferred = $q.defer();
        var user = users[userId];
        if (user) {
          deferred.resolve(user);
        } else {
          var query = new Skygear.Query(User).equalTo('_id', userId);
          Skygear.publicDB.query(query)
          .then(function(results) {
            users[userId] = results[0];
            if (!user) {
              deferred.resolve(results[0]);
            }
          });
        }
        return deferred.promise;
      },

      fetchUsers: function(userIds) {
        var userNotFetched = userIds.filter(function(userId) {
          return !users[userId];
        });

        var query = new Skygear.Query(User).contains('_id', userNotFetched);
        return Skygear.publicDB.query(query)
        .then(function(results) {
          results.forEach(function(user) {
            users[user._id] = user;
          });
          return userIds.map(function(userId) {
            return users[userId];
          });
        });
      },

      fetchAllUsersExclude: function(userIds) {
        var query = new Skygear.Query(User).notContains('_id', userIds);
        return Skygear.publicDB.query(query)
        .then(function(results) {
          results.forEach(function(user) {
            users[user._id] = user;
          });
          return results;
        });
      }
    };
  }
]);
