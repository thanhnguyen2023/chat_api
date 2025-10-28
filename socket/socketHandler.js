const jwt = require("jsonwebtoken")
const { User, Message, Conversation, Participant, MessageStatus, Notification, BlockedUser } = require("../models")
const { Op } = require("sequelize")

// Store active connections
const activeUsers = new Map() // userId -> socketId
const userSockets = new Map() // socketId -> userId

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1]

    if (!token) {
      return next(new Error("Authentication token required"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return next(new Error("Invalid token"))
    }

    socket.userId = user.user_id
    socket.user = user
    next()
  } catch (error) {
    next(new Error("Authentication failed"))
  }
}

// Join user to their conversation rooms
const joinUserRooms = async (socket) => {
  try {
    const userConversations = await Participant.findAll({
      where: { user_id: socket.userId },
      include: [
        {
          model: Conversation,
          as: "conversation",
        },
      ],
    })

    for (const participation of userConversations) {
      const roomName = `conversation_${participation.conversation_id}`
      socket.join(roomName)
    }

    console.log(`User ${socket.userId} joined ${userConversations.length} conversation rooms`)
  } catch (error) {
    console.error("Error joining user rooms:", error)
  }
}

// Broadcast user status to relevant users
const broadcastUserStatus = async (io, userId, status) => {
  try {
    // Get all conversations where this user is a participant
    const userConversations = await Participant.findAll({
      where: { user_id: userId },
      attributes: ["conversation_id"],
    })

    const conversationIds = userConversations.map((p) => p.conversation_id)

    // Get all other participants in these conversations
    const otherParticipants = await Participant.findAll({
      where: {
        conversation_id: { [Op.in]: conversationIds },
        user_id: { [Op.ne]: userId },
      },
      attributes: ["user_id"],
    })

    const uniqueUserIds = [...new Set(otherParticipants.map((p) => p.user_id))]

    // Broadcast status to active users
    uniqueUserIds.forEach((targetUserId) => {
      const targetSocketId = activeUsers.get(targetUserId)
      if (targetSocketId) {
        io.to(targetSocketId).emit("user_status_changed", {
          user_id: userId,
          status,
        })
      }
    })
  } catch (error) {
    console.error("Error broadcasting user status:", error)
  }
}

// Create notification helper
const createNotification = async (userId, type, content) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      type,
      content,
    })
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

// Main socket handler
const socketHandler = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket)

  io.on("connection", async (socket) => {
    console.log(`User ${socket.userId} connected with socket ${socket.id}`)

    // Store user connection
    activeUsers.set(socket.userId, socket.id)
    userSockets.set(socket.id, socket.userId)

    // Update user status to online
    await socket.user.update({ status: "online" })

    // Join user to their conversation rooms
    await joinUserRooms(socket)

    // Broadcast user online status
    await broadcastUserStatus(io, socket.userId, "online")

    // Send user their unread notification count
    try {
      const unreadCount = await Notification.count({
        where: {
          user_id: socket.userId,
          is_seen: false,
        },
      })
      socket.emit("unread_notifications_count", { count: unreadCount })
    } catch (error) {
      console.error("Error getting unread count:", error)
    }

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { conversation_id, content } = data

        // Validate input
        if (!conversation_id || !content || content.trim().length === 0) {
          socket.emit("error", { message: "Invalid message data" })
          return
        }

        // Check if user is participant
        const participant = await Participant.findOne({
          where: {
            conversation_id,
            user_id: socket.userId,
          },
        })

        if (!participant) {
          socket.emit("error", { message: "Access denied to this conversation" })
          return
        }

        // Get conversation and other participants
        const conversation = await Conversation.findByPk(conversation_id, {
          include: [
            {
              model: Participant,
              as: "participants",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["user_id", "username", "avatar_url"],
                },
              ],
            },
          ],
        })

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" })
          return
        }

        // Check for blocked users
        const otherParticipantIds = conversation.participants
          .filter((p) => p.user_id !== socket.userId)
          .map((p) => p.user_id)

        const blockedBy = await BlockedUser.findAll({
          where: {
            user_id: { [Op.in]: otherParticipantIds },
            blocked_user_id: socket.userId,
          },
        })

        if (blockedBy.length > 0) {
          socket.emit("error", { message: "Cannot send message - you are blocked" })
          return
        }

        // Create message
        const message = await Message.create({
          conversation_id,
          sender_id: socket.userId,
          content,
        })

        // Create message status for each participant (except sender)
        const statusPromises = otherParticipantIds.map((userId) =>
          MessageStatus.create({
            message_id: message.message_id,
            receiver_id: userId,
            status: "sent",
          }),
        )

        await Promise.all(statusPromises)

        // Get complete message with relations
        const completeMessage = await Message.findByPk(message.message_id, {
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["user_id", "username", "avatar_url"],
            },
            {
              model: MessageStatus,
              as: "statuses",
              include: [
                {
                  model: User,
                  as: "receiver",
                  attributes: ["user_id", "username"],
                },
              ],
            },
          ],
        })

        // Broadcast message to conversation room
        const roomName = `conversation_${conversation_id}`
        io.to(roomName).emit("new_message", {
          message: completeMessage,
          conversation_id,
        })

        // Send notifications to offline users
        for (const participantId of otherParticipantIds) {
          const isOnline = activeUsers.has(participantId)
          if (!isOnline) {
            const participant = conversation.participants.find((p) => p.user_id === participantId)
            const notificationContent = conversation.is_group
              ? `New message in ${conversation.conversation_name || "group chat"} from ${socket.user.username}`
              : `New message from ${socket.user.username}`

            await createNotification(participantId, "new_message", notificationContent)
          }
        }

        console.log(`Message sent in conversation ${conversation_id} by user ${socket.userId}`)
      } catch (error) {
        console.error("Send message error:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })

    // Handle typing indicators
    socket.on("typing_start", async (data) => {
      try {
        const { conversation_id } = data
        console.log("Server nhận typing_start từ", socket.userId, "data:", data)
        // Check if user is participant
        const participant = await Participant.findOne({
          where: {
            conversation_id,
            user_id: socket.userId,
          },
        })

        if (!participant) {
          return
        }

        // Broadcast typing indicator to conversation room (except sender)
        const roomName = `conversation_${conversation_id}`
        io.to(roomName).emit("user_typing", {
          user_id: socket.userId,
          username: socket.user.username,
          conversation_id,
        })
        console.log("Server nhận user_typing từ", socket.userId, "data:", socket.user.username, conversation_id)

      } catch (error) {
        console.error("Typing start error:", error)
      }
    })

    socket.on("typing_stop", async (data) => {
      try {
        const { conversation_id } = data

        // Check if user is participant
        const participant = await Participant.findOne({
          where: {
            conversation_id,
            user_id: socket.userId,
          },
        })

        if (!participant) {
          return
        }

        // Broadcast stop typing to conversation room (except sender)
        const roomName = `conversation_${conversation_id}`
        io.to(roomName).emit("user_stopped_typing", {
          user_id: socket.userId,
          username: socket.user.username,
          conversation_id,
        })
      } catch (error) {
        console.error("Typing stop error:", error)
      }
    })

    // Handle message status updates
    socket.on("message_read", async (data) => {
      try {
        const { message_id } = data

        // Update message status
        const messageStatus = await MessageStatus.findOne({
          where: {
            message_id,
            receiver_id: socket.userId,
          },
        })

        if (messageStatus && messageStatus.status !== "read") {
          await messageStatus.update({
            status: "read",
            updated_at: new Date(),
          })

          // Get message details
          const message = await Message.findByPk(message_id, {
            attributes: ["conversation_id", "sender_id"],
          })

          if (message) {
            // Notify sender about read status
            const senderSocketId = activeUsers.get(message.sender_id)
            if (senderSocketId) {
              io.to(senderSocketId).emit("message_status_updated", {
                message_id,
                reader_id: socket.userId,
                status: "read",
                conversation_id: message.conversation_id,
              })
            }
          }
        }
      } catch (error) {
        console.error("Message read error:", error)
      }
    })

    // Handle joining new conversation
    socket.on("join_conversation", async (data) => {
      try {
        const { conversation_id } = data

        // Check if user is participant
        const participant = await Participant.findOne({
          where: {
            conversation_id,
            user_id: socket.userId,
          },
        })

        if (participant) {
          const roomName = `conversation_${conversation_id}`
          socket.join(roomName)
          socket.emit("joined_conversation", { conversation_id })
          console.log(`User ${socket.userId} joined conversation ${conversation_id}`)
        } else {
          socket.emit("error", { message: "Access denied to this conversation" })
        }
      } catch (error) {
        console.error("Join conversation error:", error)
        socket.emit("error", { message: "Failed to join conversation" })
      }
    })

    // Handle leaving conversation
    socket.on("leave_conversation", (data) => {
      try {
        const { conversation_id } = data
        const roomName = `conversation_${conversation_id}`
        socket.leave(roomName)
        socket.emit("left_conversation", { conversation_id })
        console.log(`User ${socket.userId} left conversation ${conversation_id}`)
      } catch (error) {
        console.error("Leave conversation error:", error)
      }
    })

    // Handle user status updates
    socket.on("update_status", async (data) => {
      try {
        const { status } = data

        if (!["online", "offline", "busy"].includes(status)) {
          socket.emit("error", { message: "Invalid status" })
          return
        }

        await socket.user.update({ status })
        await broadcastUserStatus(io, socket.userId, status)

        socket.emit("status_updated", { status })
        console.log(`User ${socket.userId} status updated to ${status}`)
      } catch (error) {
        console.error("Update status error:", error)
        socket.emit("error", { message: "Failed to update status" })
      }
    })

    // Handle getting online users in conversation
    socket.on("get_online_users", async (data) => {
      try {
        const { conversation_id } = data

        // Check if user is participant
        const participant = await Participant.findOne({
          where: {
            conversation_id,
            user_id: socket.userId,
          },
        })

        if (!participant) {
          socket.emit("error", { message: "Access denied to this conversation" })
          return
        }

        // Get all participants
        const participants = await Participant.findAll({
          where: { conversation_id },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "username", "status"],
            },
          ],
        })

        const onlineUsers = participants
          .filter((p) => activeUsers.has(p.user_id))
          .map((p) => ({
            user_id: p.user_id,
            username: p.user.username,
            status: p.user.status,
          }))

        socket.emit("online_users", {
          conversation_id,
          online_users: onlineUsers,
        })
      } catch (error) {
        console.error("Get online users error:", error)
        socket.emit("error", { message: "Failed to get online users" })
      }
    })

    // Handle disconnect
    socket.on("disconnect", async (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`)

      try {
        // Remove from active users
        activeUsers.delete(socket.userId)
        userSockets.delete(socket.id)

        // Update user status to offline
        await socket.user.update({ status: "offline" })

        // Broadcast user offline status
        await broadcastUserStatus(io, socket.userId, "offline")
      } catch (error) {
        console.error("Disconnect error:", error)
      }
    })

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error)
    })
  })

  // Handle connection errors
  io.on("connect_error", (error) => {
    console.error("Socket.IO connection error:", error)
  })

  console.log("Socket.IO server initialized")
}

module.exports = socketHandler
