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
      fetchMessages: function(conversation) {
        const deferred = $q.defer();
        const conversationMessages = conversations[conversation.id];
        console.log(conversations);
        if (conversationMessages) {
          deferred.resolve(conversationMessages);
        }
        SkygearChat.getMessages(conversation)
        .then(function(messages) {
          console.log('Plugin get messages success', messages);

          conversations[conversation.id] = messages.results.reverse();
          const lastMessageIndex = conversations[conversation.id].length - 1;

          const lastMessage = conversations[conversation.id][lastMessageIndex];
          if (lastMessage) {
            SkygearChat.markAsLastMessageRead(
              conversation, lastMessage
            );
          }

          if (!conversationMessages) {
            deferred.resolve(conversations[conversation.id]);
          }
        });
        return deferred.promise;
      },

      // Create a new message in a conversation. For seamless usage of
      // sending message, we will first create a fake message holding
      // the message and let the message send until the response of message
      // comes back. The response message will overwrite the fake message.
      createMessage: function(conversation, body) {
        const _message = {
          body: body,
          createdAt: new Date(),
          createdBy: Skygear.currentUser.id,
          inProgress: true
        };
        conversations[conversation.id].push(_message);
        return SkygearChat.createMessage(conversation, body)
        .then(function(message) {
          console.log('Create message success', message);
          const index = conversations[conversation.id].indexOf(_message);
          conversations[conversation.id][index] = message;
          $rootScope.$apply();
          return message;
        });
      },

      // This function is used by chat pubsub on message created event.
      // It pushes the incoming message to the message list according to
      // the conversation it belongs to.
      onMessageCreated: function(message) {
        console.log('message on create', message);
        const conversationId = message.conversation_id.id;
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
