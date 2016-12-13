angular.module('app.services.users', [])

/**
 * Users factory helps getting users and store them locally
 * for faster fetch.
 */
.factory('Users', ['Skygear', '$q',
  function(Skygear, $q) {
    var users = {};
    var User = Skygear.Record.extend('user');

    return {
      users: users,

      // This intent to return user already exsit by fullID.
      // Assuming the controller already take care of the pre-loading
      getByID: function(fullID) {
        const _id = fullID.split('/')[1];
        return users[_id];
      },

      // Fetch user given user id
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

      // Fetch users given a set of user ids
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

      // Fetch users except some user ids
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
