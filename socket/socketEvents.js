// Socket.IO event constants and documentation

const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  // Message events
  SEND_MESSAGE: "send_message",
  NEW_MESSAGE: "new_message",
  MESSAGE_READ: "message_read",
  MESSAGE_STATUS_UPDATED: "message_status_updated",

  // Typing events
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",
  USER_TYPING: "user_typing",
  USER_STOPPED_TYPING: "user_stopped_typing",

  // Conversation events
  JOIN_CONVERSATION: "join_conversation",
  LEAVE_CONVERSATION: "leave_conversation",
  JOINED_CONVERSATION: "joined_conversation",
  LEFT_CONVERSATION: "left_conversation",

  // User status events
  UPDATE_STATUS: "update_status",
  STATUS_UPDATED: "status_updated",
  USER_STATUS_CHANGED: "user_status_changed",
  GET_ONLINE_USERS: "get_online_users",
  ONLINE_USERS: "online_users",

  // Notification events
  UNREAD_NOTIFICATIONS_COUNT: "unread_notifications_count",
  NEW_NOTIFICATION: "new_notification",

  // Error events
  ERROR: "error"
}

/**
 * Socket.IO Event Documentation
 *
 * CLIENT TO SERVER EVENTS:
 *
 * send_message: { conversation_id: number, content: string }
 * - Send a new message to a conversation
 *
 * typing_start: { conversation_id: number }
 * - Indicate user started typing in a conversation
 *
 * typing_stop: { conversation_id: number }
 * - Indicate user stopped typing in a conversation
 *
 * message_read: { message_id: number }
 * - Mark a message as read
 *
 * join_conversation: { conversation_id: number }
 * - Join a conversation room for real-time updates
 *
 * leave_conversation: { conversation_id: number }
 * - Leave a conversation room
 *
 * update_status: { status: 'online' | 'offline' | 'busy' }
 * - Update user's online status
 *
 * get_online_users: { conversation_id: number }
 * - Get list of online users in a conversation
 *
 *
 * SERVER TO CLIENT EVENTS:
 *
 * new_message: { message: MessageObject, conversation_id: number }
 * - New message received in a conversation
 *
 * user_typing: { user_id: number, username: string, conversation_id: number }
 * - Another user started typing
 *
 * user_stopped_typing: { user_id: number, conversation_id: number }
 * - Another user stopped typing
 *
 * message_status_updated: { message_id: number, reader_id: number, status: string, conversation_id: number }
 * - Message read status updated
 *
 * joined_conversation: { conversation_id: number }
 * - Successfully joined conversation room
 *
 * left_conversation: { conversation_id: number }
 * - Successfully left conversation room
 *
 * user_status_changed: { user_id: number, status: string }
 * - Another user's status changed
 *
 * status_updated: { status: string }
 * - Your status was updated successfully
 *
 * online_users: { conversation_id: number, online_users: UserObject[] }
 * - List of online users in conversation
 *
 * unread_notifications_count: { count: number }
 * - Number of unread notifications
 *
 * new_notification: { notification: NotificationObject }
 * - New notification received
 *
 * error: { message: string }
 * - Error occurred
 */

module.exports = SOCKET_EVENTS
