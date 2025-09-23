const { activeUsers } = require("../socket/socketHandler")

/**
 * Check if a user is currently online
 * @param {number} userId - User ID to check
 * @returns {boolean} - True if user is online
 */
const isUserOnline = (userId) => {
  return activeUsers.has(userId)
}

/**
 * Get socket ID for a user
 * @param {number} userId - User ID
 * @returns {string|null} - Socket ID or null if not online
 */
const getUserSocketId = (userId) => {
  return activeUsers.get(userId) || null
}

/**
 * Get all online users from a list of user IDs
 * @param {number[]} userIds - Array of user IDs
 * @returns {number[]} - Array of online user IDs
 */
const getOnlineUsers = (userIds) => {
  return userIds.filter((userId) => isUserOnline(userId))
}

/**
 * Send real-time notification to user if online
 * @param {Object} io - Socket.IO instance
 * @param {number} userId - Target user ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const sendToUser = (io, userId, event, data) => {
  const socketId = getUserSocketId(userId)
  if (socketId) {
    io.to(socketId).emit(event, data)
    return true
  }
  return false
}

/**
 * Send real-time notification to multiple users
 * @param {Object} io - Socket.IO instance
 * @param {number[]} userIds - Array of target user IDs
 * @param {string} event - Event name
 * @param {Object} data - Event data
 * @returns {number} - Number of users who received the notification
 */
const sendToUsers = (io, userIds, event, data) => {
  let sentCount = 0
  userIds.forEach((userId) => {
    if (sendToUser(io, userId, event, data)) {
      sentCount++
    }
  })
  return sentCount
}

/**
 * Broadcast to conversation room
 * @param {Object} io - Socket.IO instance
 * @param {number} conversationId - Conversation ID
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const broadcastToConversation = (io, conversationId, event, data) => {
  const roomName = `conversation_${conversationId}`
  io.to(roomName).emit(event, data)
}

/**
 * Get room name for conversation
 * @param {number} conversationId - Conversation ID
 * @returns {string} - Room name
 */
const getConversationRoom = (conversationId) => {
  return `conversation_${conversationId}`
}

module.exports = {
  isUserOnline,
  getUserSocketId,
  getOnlineUsers,
  sendToUser,
  sendToUsers,
  broadcastToConversation,
  getConversationRoom,
}
