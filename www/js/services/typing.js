angular.module('app.services.typing', [])

/**
 */
.factory('Typing', [
  'SkygearChat', 'Skygear', 'Users', '$q', '$rootScope', '$state',
  function(SkygearChat, Skygear, Users, $q, $rootScope, $state) {
    /* byConversation hold the text that is read to be displyed by view.
     *
     * {
     *   "conversation/id": {
     *     "typing": "Rick & Ben",
     *     "names": ["Rick", "Ben"],
     *     "updateAt": "2016-12-12T09:43:59.446Z"
     *   },
     *   "conversation/id": {
     *     "typing": "Rick, Ben & 2 others",
     *     "names": ["Rick", "Ben", "Roy", ""],
     *     "updateAt": "2016-12-12T09:46:59.446Z"
     *   }
     * }
     */
    const byConversation = {};
    const getByConversation = function(conversationID) {
      if (!byConversation[conversationID]) {
        byConversation[conversationID] = {
          typing: null,
          names: [],
          updateAt: null
        };
      }
      return byConversation[conversationID];
    };

    return {
      getByConversation: getByConversation,

      // This function will send the typing indicator to Skygear server so
      // other will able to display who is typing
      begin: function(conversation) {
        SkygearChat.sendTypingIndicator(conversation, 'begin');
      },

      finished: function(conversation) {
        SkygearChat.sendTypingIndicator(conversation, 'finished');
      },

      onTyping: function(conversationID, payload) {
        const typingUsers = getByConversation(conversationID);
        let names = typingUsers.names;
        angular.forEach(payload, function (s, id) {
          const user = Users.getByID(id);
          if (user._id === skygear.currentUser.id) {
            return;
          }
          const i = names.indexOf(user.name);
          if (user.name && s.event === 'finished') {
            if (i !== -1) {
              names.splice(i, 1);
            }
          }
          if (user.name && s.event === 'begin') {
            if (i === -1) {
              names.push(user.name);
            }
          }
        });
        typingUsers.typing = names.join(", ");
        typingUsers.updateAt = new Date();
      }

    };
  }
]);
