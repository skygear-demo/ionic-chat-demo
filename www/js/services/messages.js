angular.module('app.services.messages', [])

.factory('Messages', ['SkygearChat', 'Skygear', '$q', '$rootScope',
  function(SkygearChat, Skygear, $q, $rootScope) {
    var conversations = {};

    return {
      conversations: conversations,

      fetchMessages: function(conversationId) {
        var deferred = $q.defer();
        var conversationMessages = conversations[conversationId];
        if (conversationMessages) {
          deferred.resolve(conversationMessages);
        }
        SkygearChat.getMessages(conversationId)
        .then(function(messages) {
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

      createMessage: function(conversationId, body) {
        var _message = {
          body: body,
          createdAt: new Date(),
          createdBy: Skygear.currentUser.id,
          inProgress: true
        };
        conversations[conversationId].push(_message);
        return SkygearChat.createMessage(conversationId, body)
        .then(function(message) {
          console.log('Create message success', message);
          var index = conversations[conversationId].indexOf(_message);
          conversations[conversationId][index] = message;
          $rootScope.$apply();
          return message;
        });
      },

      onMessageCreated: function(message) {
        var conversationId = message.conversation_id._id.split('/')[1];
        if (message.createdBy !== Skygear.currentUser.id &&
            conversations[conversationId]) {
          conversations[conversationId].push(message);
          $rootScope.$broadcast('new-message-received');
          $rootScope.$apply();
        }
      }
    };
  }
]);
