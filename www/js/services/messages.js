angular.module('app.services.messages', [])

/**
 * Messages factory performs actions of messages
 * such as getting messages and create messages.
 *
 * This factory also hode a cache of messages in terms of
 * conversations for fast fetching of messages given conversation id.
 */
.factory('Messages', ['SkygearChat', 'Skygear', '$q', '$rootScope',
  function(SkygearChat, Skygear, $q, $rootScope) {
    var conversations = {};

    return {
      conversations: conversations,

      // Getting messages of a conversation
      fetchMessages: function(conversationId) {
        const deferred = $q.defer();
        const conversationMessages = conversations[conversationId];
        if (conversationMessages) {
          deferred.resolve(conversationMessages);
        }
        SkygearChat.getMessages(conversationId)
        .then(function(messages) {
          console.log('Plugin get messages success', messages);

          conversations[conversationId] = messages.results.reverse();
          const lastMessageIndex = conversations[conversationId].length - 1;

          SkygearChat.markAsLastMessageRead(
            conversationId, conversations[conversationId][lastMessageIndex]._id
          );

          if (!conversationMessages) {
            deferred.resolve(conversations[conversationId]);
          }
        });
        return deferred.promise;
      },

      // Create a new message in a conversation. For seamless usage of
      // sending message, we will first create a fake message holding
      // the message and let the message send until the response of message
      // comes back. The response message will overwrite the fake message.
      createMessage: function(conversationId, body) {
        const _message = {
          body: body,
          createdAt: new Date(),
          createdBy: Skygear.currentUser.id,
          inProgress: true
        };
        conversations[conversationId].push(_message);
        return SkygearChat.createMessage(conversationId, body)
        .then(function(message) {
          console.log('Create message success', message);
          const index = conversations[conversationId].indexOf(_message);
          conversations[conversationId][index] = message;
          $rootScope.$apply();
          return message;
        });
      },

      // This function is used by chat pubsub on message created event.
      // It pushes the incoming message to the message list according to
      // the conversation it belongs to.
      onMessageCreated: function(message) {
        const conversationId = message.conversation_id._id.split('/')[1];
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
