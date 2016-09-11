angular.module('app.services.conversations', [])

.factory('Conversations', [
  'SkygearChat', 'Skygear', 'Users', '$q', '$rootScope', '$state',
  function(SkygearChat, Skygear, Users, $q, $rootScope, $state) {
    var conversations = {
      directConversations: [],
      groupConversations: []
    };

    var cache = function(conversation) {
      conversations[conversation._id] = conversation;
    };

    var getOtherUserIdFromDirectConversation = function(conversation) {
      return conversation.participant_ids
      .filter(function(p) {
        return p !== Skygear.currentUser.id;
      });
    };

    var setUnreadCount = function(conversationId, count) {
      conversations.groupConversations.forEach(function(userConversation) {
        if (userConversation.conversation._id === conversationId) {
          userConversation.unread_count = count;
        }
      });
      conversations.directConversations.forEach(function(userConversation) {
        if (userConversation.conversation._id === conversationId) {
          userConversation.unread_count = count;
        }
      });
    };

    return {
      conversations: conversations,

      fetchConversations: function() {
        return SkygearChat.getConversations()
        .then(function(userConversations) {
          conversations.directConversations = userConversations
          .filter(function(c) {
            return c.$transient.conversation.is_direct_message;
          }).map(function(c) {
            var conversation = c.$transient.conversation;
            conversation.otherUserId = getOtherUserIdFromDirectConversation(
              conversation);
            return c;
          });

          conversations.groupConversations = userConversations
          .filter(function(c) {
            return !c.$transient.conversation.is_direct_message;
          });

          $rootScope.$apply();

          userConversations.forEach(function(c) {
            cache(c.$transient.conversation);
          });

          const users = userConversations.reduce(function(prev, curr) {
            return prev.concat(curr.$transient.conversation.participant_ids);
          }, []);

          return Users.fetchUsers(users)
          .then(function() {
            return userConversations;
          });
        });
      },

      fetchConversation: function(conversationId) {
        var deferred = $q.defer();
        var conversation = conversations[conversationId];
        if (conversation) {
          deferred.resolve(conversation);
        } else {
          SkygearChat.getConversation(conversationId)
          .then(function(userConversation) {
            conversation = userConversation.$transient.conversation;
            cache(conversation);

            Users.fetchUsers(conversation.participant_ids)
            .then(function() {
              deferred.resolve(conversation);
            });
          });
        }
        return deferred.promise;
      },

      createGroupConversation: function(title) {
        return SkygearChat.createConversation(
          [Skygear.currentUser.id], [Skygear.currentUser.id], title
        ).then(function(conversation) {
          cache(conversation);
          return SkygearChat.getConversation(conversation._id);
        }).then(function(userConversation) {
          conversations.groupConversations.push(userConversation);
          return userConversation;
        });
      },

      addParticipant: function(conversationId, userId) {
        return SkygearChat.addParticipants(conversationId, [userId])
        .then(function(conversation) {
          console.log('Add participant success', conversation);
          cache(conversation);
          return conversation;
        });
      },

      createDirectConversation: function(userId) {
        return SkygearChat.getOrCreateDirectConversation(userId)
        .then(function(conversation) {
          return SkygearChat.getConversation(conversation._id);
        }).then(function(userConversation) {
          const conversation = userConversation.$transient.conversation;
          conversation.otherUserId = getOtherUserIdFromDirectConversation(
            conversation);
          cache(conversation);
          conversations.directConversations.push(userConversation);
          return userConversation;
        });
      },

      setUnreadCount: function(conversationId, count) {
        conversationId = 'conversation/' + conversationId;
        setUnreadCount(conversationId, count);
      },

      onConversationUpdated: function(conversation) {
        SkygearChat.getConversation(conversation._id)
        .then(function(userConversation) {
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
        }, function(error) {
          if (conversation.is_direct_message) {
            conversations.directConversations = conversations
            .directConversations.filter(function(us) {
              return us.$transient.conversation._id !== conversation._id;
            });
          } else {
            conversations.groupConversations = conversations.groupConversations
            .filter(function(us) {
              return us.$transient.conversation._id !== conversation._id;
            });
          }
          $rootScope.$apply();
        });
      },

      onMessageCreated: function(message) {
        var conversationId = message.conversation_id._id;
        SkygearChat.getUnreadMessageCount(conversationId.split('/')[1])
        .then(function(unreadMessageCount) {
          if (conversationId.indexOf($state.params.id) === -1) {
            setUnreadCount(conversationId, unreadMessageCount);
            $rootScope.$apply();
          } else {
            SkygearChat.markAsLastMessageRead(
              conversationId.split('/')[1], message._id);
          }
        });
      }
    };
  }
]);
