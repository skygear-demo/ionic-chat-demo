angular.module('app.services', [])

.factory('Conversations', ['SkygearChat', 'Skygear', 'Users', '$q', 
function (SkygearChat, Skygear, Users, $q) {
  var conversations = {
    directConversations: [],
    groupConversations: [],
  };

  var cache = function (conversation) {
    conversations[conversation._id] = conversation;
  };

  return {
    conversations: conversations,

    fetchConversations: function () {
      return SkygearChat.getConversations()
      .then(function (userConversations) {
        console.log(userConversations);
        conversations.directConversations = userConversations
        .filter(function (c) {
          return c.$transient.conversation.is_direct_message;
        }).map(function (c) {
          var conversation = c.$transient.conversation;
          conversation.otherUserId = conversation.participant_ids
          .filter(function (p) {
            return p !== Skygear.currentUser.id;
          });
          return c;
        });

        conversations.groupConversations = userConversations
        .filter(function (c) {
          return !c.$transient.conversation.is_direct_message;
        });

        userConversations.forEach(function (c) {
          cache(c.$transient.conversation);
        });

        users = userConversations.reduce(function (prev, curr) {
          return prev.concat(curr.$transient.conversation.participant_ids);
        }, []);

        return Users.fetchUsers(users)
        .then(function () {
          return userConversations;
        });
      });
    },

    fetchConversation: function (conversationId) {
      var deferred = $q.defer();
      var conversation = conversations[conversationId];
      if (conversation) {
        deferred.resolve(conversation);
      } else {
        SkygearChat.getConversation(conversationId)
        .then(function (userConversation) {
          conversation = userConversation.$transient.conversation;
          cache(conversation);

          Users.fetchUsers(conversation.participant_ids)
          .then(function () {
            deferred.resolve(conversation);
          });
        });
      }
      return deferred.promise;
    },

    createGroupConversation: function (title) {
      return SkygearChat.createConversation(
        [Skygear.currentUser.id], [Skygear.currentUser.id], title
      ).then(function (conversation) {
        cache(conversation);
        return SkygearChat.getConversation(conversation._id);
      }).then(function (userConversation) {
        conversations.groupConversations.push(userConversation);
        return userConversation;
      });
    },

    addParticipant: function (conversationId, userId) {
      return SkygearChat.addParticipants(conversationId, [userId])
      .then(function (conversation) {
        console.log('Add participant success', conversation);
        cache(conversation);
        return conversation;
      });
    },

    createDirectConversation: function (userId) {
      return SkygearChat.getOrCreateDirectConversation(userId)
      .then(function (conversation) {
        cache(conversation);
        return SkygearChat.getConversation(conversation._id);
      }).then(function (userConversation) {
        conversation.directConversations.push(userConversation);
        return userConversation;
      });
    },
  };
}])

.factory('Messages', ['SkygearChat', 'Skygear', '$q', '$rootScope',
function (SkygearChat, Skygear, $q, $rootScope) {
  var conversations = {};

  return {
    conversations: conversations,

    fetchMessages: function (conversationId) {
      var deferred = $q.defer();
      var conversationMessages = conversations[conversationId];
      if (conversationMessages) {
        deferred.resolve(conversationMessages);
      }
      SkygearChat.getMessages(conversationId)
      .then(function (messages) {
        console.log('Plugin get messages success', messages);
        conversations[conversationId] = messages.results.reverse();
        if (!conversationMessages) {
          deferred.resolve(conversations[conversationId]);
        }
      });
      return deferred.promise;
    },

    createMessage: function (conversationId, body) {
      var _message = {
        body: body,
        _created_at: new Date(),
        _created_by: Skygear.currentUser.id,
        _in_progress: true,
      };
      conversations[conversationId].push(_message);
      return SkygearChat.createMessage(conversationId, body)
      .then(function (message) {
        console.log('Create message success', message);
        message._created_at = message.createdAt;
        message._created_by = message.createdBy;
        var index = conversations[conversationId].indexOf(_message);
        console.log(index);
        conversations[conversationId][index] = message;
        $rootScope.$apply();
        return message;
      });
    },

    onMessagesCreated: function (message) {

    },
  };
}])

.factory('Users', ['Skygear', '$q',
function (Skygear, $q) {
  var users = {};
  var User = Skygear.Record.extend('user');

  return {
    users: users,

    fetchUser: function (userId) {
      var deferred = $q.defer();
      var user = users[userId];
      if (user) {
        deferred.resolve(user);
      } else {
        var query = new Skygear.Query(User).equalTo('_id', userId);
        Skygear.publicDB.query(query)
        .then(function (results) {
          users[userId] = results[0];
          if (!user) {
            deferred.resolve(results[0]);
          }
        });
      }
      return deferred.promise;
    },

    fetchUsers: function (userIds) {
      var userNotFetched = userIds.filter(function (userId) {
        return !users[userId];
      });

      var query = new Skygear.Query(User).contains('_id', userNotFetched);
      return Skygear.publicDB.query(query)
      .then(function (results) {
        results.forEach(function (user) {
          users[user._id] = user;
        });
        return userIds.map(function (userId) {
          return users[userId];
        });
      })
    },

    fetchAllUsersExclude: function (userIds) {
      var query = new Skygear.Query(User).notContains('_id', userIds);
      return Skygear.publicDB.query(query)
      .then(function (results) {
        results.forEach(function (user) {
          users[user._id] = user;
        });
        return results;
      });
    },
  };
}])

.factory('SkygearChatEvent', ['SkygearChat', 'Conversations', 'Messages',
function (SkygearChat, Conversations, Messages) {
  var handler = function (data) {
    console.log(data);
    if (data.record_type === 'message') {
      if (data.event_type === 'create') {
        Messages.onMessageCreated(data.record);
      }
    }
  };
  var subscribed = false;

  return {
    subscribe: function () {
      if (!subscribed) {
        SkygearChat.subscribe(handler);
        subscribed = true;
      }
    },
  };
}])

.service('Skygear', ['$window',
function ($window) {
  return $window.skygear;
}])

.service('SkygearChat', ['$window',
function ($window) {
  return $window.skygear_chat;
}]);