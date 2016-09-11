angular.module('app.services.skygearChatEvent', [])

.factory('SkygearChatEvent', [
  'SkygearChat', 'Conversations', 'Messages', 'Users', '$rootScope',
  function(SkygearChat, Conversations, Messages, Users, $rootScope) {
    var handler = function(data) {
      console.log('Skygear chat event received', data);
      if (data.record_type === 'message') {
        if (data.event_type === 'create') {
          Conversations.onMessageCreated(data.record);
          Messages.onMessageCreated(data.record);
        }
      } else if (data.record_type === 'conversation') {
        if (data.event_type === 'update') {
          Conversations.onConversationUpdated(data.record);
          Users.fetchUsers(data.record.participant_ids).then(function() {
            $rootScope.$apply();
          });
        }
      }
    };
    var subscribed = false;

    return {
      subscribe: function() {
        if (!subscribed) {
          SkygearChat.subscribe(handler);
          subscribed = true;
        }
      }
    };
  }
]);
