angular.module('app.services.skygearChatEvent', [])

/**
 * SkygearChatEvent factory simply handles events and its related data
 * and delegate it to corresponsding model. This factory gives an example
 * how to handle message create and conversation update events and pass
 * them to Messages and Conversations factory repectively.
 */
.factory('SkygearChatEvent', [
  'SkygearChat', 'Conversations', 'Messages', 'Typing', 'Users', '$rootScope',
  function(SkygearChat, Conversations, Messages, Typing, Users, $rootScope) {
    const handler = function(data) {
      console.log('Skygear chat event received', data);
      if (data.record_type === 'message') {
        if (data.event_type === 'create') {
          // Handle message create event
          Conversations.onMessageCreated(data.record);
          Messages.onMessageCreated(data.record);
        }
      } else if (data.record_type === 'conversation') {
        if (data.event_type === 'update') {
          // Handle conversation update event
          Conversations.onConversationUpdated(data.record);
          Users.fetchUsers(data.record.participant_ids).then(function() {
            $rootScope.$apply();
          });
        }
      }
    };

    typingHandler = function(data) {
      angular.forEach(data, function (t, conversationID) {
        Typing.onTyping(conversationID, t);
      });
      // To apply non-UI trigger changes.
      $rootScope.$apply();
    };

    return {
      // Entry point of starting event subscription
      subscribe: function() {
        SkygearChat.subscribe(handler);
        SkygearChat.subscribeAllTypingIndicator(typingHandler);
      }
    };
  }
]);
