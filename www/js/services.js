angular.module('app.services', [])

.factory('Conversations', ['SkygearChat', 'Skygear', 'Users', '$q', '$rootScope', '$state',
function (SkygearChat, Skygear, Users, $q, $rootScope, $state) {
  var conversations = {
    directConversations: [],
    groupConversations: [],
  };

  var cache = function (conversation) {
    conversations[conversation._id] = conversation;
  };

  var getOtherUserIdFromDirectConversation = function (conversation) {
    return conversation.participant_ids
    .filter(function (p) {
      return p !== Skygear.currentUser.id;
    });
  }

  var setUnreadCount = function (conversationId, count) {
    conversations.groupConversations.forEach(function (userConversation) {
      if (userConversation.conversation._id === conversationId) {
        userConversation.unread_count = count;
      }
    });
    conversations.directConversations.forEach(function (userConversation) {
      if (userConversation.conversation._id === conversationId) {
        userConversation.unread_count = count;
      }
    });
  };

  return {
    conversations: conversations,

    fetchConversations: function () {
      return SkygearChat.getConversations()
      .then(function (userConversations) {
        conversations.directConversations = userConversations
        .filter(function (c) {
          return c.$transient.conversation.is_direct_message;
        }).map(function (c) {
          var conversation = c.$transient.conversation;
          conversation.otherUserId = getOtherUserIdFromDirectConversation(
            conversation);
          return c;
        });

        conversations.groupConversations = userConversations
        .filter(function (c) {
          return !c.$transient.conversation.is_direct_message;
        });

        $rootScope.$apply();

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
        return SkygearChat.getConversation(conversation._id);
      }).then(function (userConversation) {
        conversation = userConversation.$transient.conversation;
        conversation.otherUserId = getOtherUserIdFromDirectConversation(
          conversation);
        cache(conversation);
        conversations.directConversations.push(userConversation);
        return userConversation;
      });
    },

    setUnreadCount: function (conversationId, count) {
      conversationId = 'conversation/' + conversationId;
      setUnreadCount(conversationId, count);
    },

    onConversationUpdated: function (conversation) {
      SkygearChat.getConversation(conversation._id)
      .then(function (userConversation) {
        console.log('On conversation updated get conversation success', userConversation);
        conversation = userConversation.$transient.conversation;
        if (conversation.ownerID === Skygear.currentUser.id) {
          return;
        }
        cache(conversation);
        if (conversation.is_direct_message) {
          conversation.otherUserId = getOtherUserIdFromDirectConversation(
            conversation);
          conversations.directConversations.push(userConversation);
        } else {
          conversations.groupConversations.push(userConversation);
        }
        $rootScope.$apply();
      }, function (error) {
        if (conversation.is_direct_message) {
          conversations.directConversations = conversations.directConversations
          .filter(function (userConversation) {
            return userConversation.$transient.conversation._id !== conversation._id;
          });
        } else {
          conversations.groupConversations = conversations.groupConversations
          .filter(function (userConversation) {
            return userConversation.$transient.conversation._id !== conversation._id;
          });
        }
        $rootScope.$apply();
      });
    },

    onMessageCreated: function (message) {
      var conversationId = message.conversation_id._id;
      SkygearChat.getUnreadMessageCount(conversationId.split('/')[1])
      .then(function (unreadMessageCount) {
        if (conversationId.indexOf($state.params.id) === -1) {
          setUnreadCount(conversationId, unreadMessageCount);
          $rootScope.$apply();
        } else {
          SkygearChat.markAsLastMessageRead(conversationId.split('/')[1], message._id);
        }
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
        var lastMessageIndex = conversations[conversationId].length - 1;

        SkygearChat.markAsLastMessageRead(
          conversationId, conversations[conversationId][lastMessageIndex]._id
        );

        if (!conversationMessages) {
          deferred.resolve(conversations[conversationId]);
        }
      });
      return deferred.promise;
    },

    createMessage: function (conversationId, body) {
      var _message = {
        body: body,
        createdAt: new Date(),
        createdBy: Skygear.currentUser.id,
        inProgress: true,
      };
      conversations[conversationId].push(_message);
      return SkygearChat.createMessage(conversationId, body)
      .then(function (message) {
        console.log('Create message success', message);
        var index = conversations[conversationId].indexOf(_message);
        conversations[conversationId][index] = message;
        $rootScope.$apply();
        return message;
      });
    },

    onMessageCreated: function (message) {
      var conversationId = message.conversation_id._id.split('/')[1];
      if (message.createdBy !== Skygear.currentUser.id && conversations[conversationId]) {
        conversations[conversationId].push(message);
        $rootScope.$apply();
      }
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

.factory('SkygearChatEvent', ['SkygearChat', 'Conversations', 'Messages', 'Users', '$rootScope',
function (SkygearChat, Conversations, Messages, Users, $rootScope) {
  var handler = function (data) {
    console.log('Skygear chat event received', data);
    if (data.record_type === 'message') {
      if (data.event_type === 'create') {
        Conversations.onMessageCreated(data.record);
        Messages.onMessageCreated(data.record);
      }
    } else if (data.record_type === 'conversation') {
      if (data.event_type === 'update') {
        Conversations.onConversationUpdated(data.record);
        Users.fetchUsers(data.record.participant_ids).then(function () {
          $rootScope.$apply();
        });
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