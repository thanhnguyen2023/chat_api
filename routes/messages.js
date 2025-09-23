const express = require("express")
const { Op } = require("sequelize")
const { Message, Conversation, Participant, User, Attachment, MessageStatus, BlockedUser } = require("../models")
const { authenticateToken } = require("../middleware/auth")
const { validate, schemas } = require("../utils/validation")

const router = express.Router()

// Get messages for a conversation
router.get("/conversation/:conversationId", authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params
    const { page = 1, limit = 50, before_message_id } = req.query
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Check if user is participant
    const participant = await Participant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: req.user.user_id,
      },
    })

    if (!participant) {
      return res.status(403).json({
        error: { message: "Access denied to this conversation" },
      })
    }

    // Build where clause
    const whereClause = { conversation_id: conversationId }

    // For pagination using message ID (more efficient for large datasets)
    if (before_message_id) {
      whereClause.message_id = { [Op.lt]: before_message_id }
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "username", "avatar_url"],
        },
        {
          model: Attachment,
          as: "attachments",
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
      limit: Number.parseInt(limit),
      offset: before_message_id ? 0 : offset,
      order: [["created_at", "DESC"]],
    })

    res.json({
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(count / Number.parseInt(limit)),
          total_count: count,
          per_page: Number.parseInt(limit),
          has_more: messages.length === Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get messages error:", error)
    res.status(500).json({
      error: { message: "Failed to get messages" },
    })
  }
})

// Send message
router.post("/", authenticateToken, validate(schemas.sendMessage), async (req, res) => {
  try {
    const { content, conversation_id } = req.body

    // Check if user is participant
    const participant = await Participant.findOne({
      where: {
        conversation_id,
        user_id: req.user.user_id,
      },
    })

    if (!participant) {
      return res.status(403).json({
        error: { message: "Access denied to this conversation" },
      })
    }

    // Get conversation and other participants
    const conversation = await Conversation.findByPk(conversation_id, {
      include: [
        {
          model: Participant,
          as: "participants",
          where: { user_id: { [Op.ne]: req.user.user_id } },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id"],
            },
          ],
        },
      ],
    })

    if (!conversation) {
      return res.status(404).json({
        error: { message: "Conversation not found" },
      })
    }

    // Check if sender is blocked by any participant
    const otherParticipantIds = conversation.participants.map((p) => p.user.user_id)
    const blockedBy = await BlockedUser.findAll({
      where: {
        user_id: { [Op.in]: otherParticipantIds },
        blocked_user_id: req.user.user_id,
      },
    })

    if (blockedBy.length > 0) {
      return res.status(403).json({
        error: { message: "Cannot send message - you are blocked by one or more participants" },
      })
    }

    // Create message
    const message = await Message.create({
      conversation_id,
      sender_id: req.user.user_id,
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

    res.status(201).json({
      message: "Message sent successfully",
      data: { message: completeMessage },
    })
  } catch (error) {
    console.error("Send message error:", error)
    res.status(500).json({
      error: { message: "Failed to send message" },
    })
  }
})

// Get message by ID
router.get("/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params

    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "username", "avatar_url"],
        },
        {
          model: Conversation,
          as: "conversation",
          include: [
            {
              model: Participant,
              as: "participants",
              where: { user_id: req.user.user_id },
              attributes: [],
            },
          ],
        },
        {
          model: Attachment,
          as: "attachments",
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

    if (!message) {
      return res.status(404).json({
        error: { message: "Message not found or access denied" },
      })
    }

    res.json({
      data: { message },
    })
  } catch (error) {
    console.error("Get message error:", error)
    res.status(500).json({
      error: { message: "Failed to get message" },
    })
  }
})

// Update message (edit)
router.put("/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params
    const { content } = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: { message: "Message content cannot be empty" },
      })
    }

    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: Conversation,
          as: "conversation",
          include: [
            {
              model: Participant,
              as: "participants",
              where: { user_id: req.user.user_id },
              attributes: [],
            },
          ],
        },
      ],
    })

    if (!message) {
      return res.status(404).json({
        error: { message: "Message not found or access denied" },
      })
    }

    // Only sender can edit message
    if (message.sender_id !== req.user.user_id) {
      return res.status(403).json({
        error: { message: "Can only edit your own messages" },
      })
    }

    // Check if message is not too old (e.g., 15 minutes)
    const messageAge = Date.now() - new Date(message.created_at).getTime()
    const maxEditTime = 15 * 60 * 1000 // 15 minutes

    if (messageAge > maxEditTime) {
      return res.status(403).json({
        error: { message: "Message is too old to edit" },
      })
    }

    await message.update({ content })

    res.json({
      message: "Message updated successfully",
      data: { message },
    })
  } catch (error) {
    console.error("Update message error:", error)
    res.status(500).json({
      error: { message: "Failed to update message" },
    })
  }
})

// Delete message
router.delete("/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params

    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: Conversation,
          as: "conversation",
          include: [
            {
              model: Participant,
              as: "participants",
              where: { user_id: req.user.user_id },
              attributes: [],
            },
          ],
        },
      ],
    })

    if (!message) {
      return res.status(404).json({
        error: { message: "Message not found or access denied" },
      })
    }

    // Only sender can delete message
    if (message.sender_id !== req.user.user_id) {
      return res.status(403).json({
        error: { message: "Can only delete your own messages" },
      })
    }

    await message.destroy()

    res.json({
      message: "Message deleted successfully",
    })
  } catch (error) {
    console.error("Delete message error:", error)
    res.status(500).json({
      error: { message: "Failed to delete message" },
    })
  }
})

// Update message status (mark as read/delivered)
router.patch("/:messageId/status", authenticateToken, validate(schemas.updateMessageStatus), async (req, res) => {
  try {
    const { messageId } = req.params
    const { status } = req.body

    // Find message status for current user
    const messageStatus = await MessageStatus.findOne({
      where: {
        message_id: messageId,
        receiver_id: req.user.user_id,
      },
      include: [
        {
          model: Message,
          as: "message",
          include: [
            {
              model: Conversation,
              as: "conversation",
              include: [
                {
                  model: Participant,
                  as: "participants",
                  where: { user_id: req.user.user_id },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!messageStatus) {
      return res.status(404).json({
        error: { message: "Message status not found or access denied" },
      })
    }

    await messageStatus.update({
      status,
      updated_at: new Date(),
    })

    res.json({
      message: "Message status updated successfully",
      data: { status: messageStatus.status },
    })
  } catch (error) {
    console.error("Update message status error:", error)
    res.status(500).json({
      error: { message: "Failed to update message status" },
    })
  }
})

// Mark all messages in conversation as read
router.patch("/conversation/:conversationId/read", authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params

    // Check if user is participant
    const participant = await Participant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: req.user.user_id,
      },
    })

    if (!participant) {
      return res.status(403).json({
        error: { message: "Access denied to this conversation" },
      })
    }

    // Update all unread message statuses
    const [updatedCount] = await MessageStatus.update(
      {
        status: "read",
        updated_at: new Date(),
      },
      {
        where: {
          receiver_id: req.user.user_id,
          status: { [Op.ne]: "read" },
        },
        include: [
          {
            model: Message,
            as: "message",
            where: { conversation_id: conversationId },
          },
        ],
      },
    )

    res.json({
      message: "Messages marked as read",
      data: { updated_count: updatedCount },
    })
  } catch (error) {
    console.error("Mark messages as read error:", error)
    res.status(500).json({
      error: { message: "Failed to mark messages as read" },
    })
  }
})

// Search messages
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const { q: query, conversation_id, page = 1, limit = 20 } = req.query
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: { message: "Search query is required" },
      })
    }

    // Build where clause
    const whereClause = {
      content: { [Op.like]: `%${query}%` },
    }

    if (conversation_id) {
      whereClause.conversation_id = conversation_id
    }

    // Get user's conversations to limit search scope
    const userConversations = await Participant.findAll({
      where: { user_id: req.user.user_id },
      attributes: ["conversation_id"],
    })

    const conversationIds = userConversations.map((p) => p.conversation_id)

    if (!conversation_id) {
      whereClause.conversation_id = { [Op.in]: conversationIds }
    } else if (!conversationIds.includes(Number.parseInt(conversation_id))) {
      return res.status(403).json({
        error: { message: "Access denied to this conversation" },
      })
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "username", "avatar_url"],
        },
        {
          model: Conversation,
          as: "conversation",
          attributes: ["conversation_id", "conversation_name", "is_group"],
        },
      ],
      limit: Number.parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    })

    res.json({
      data: {
        messages,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(count / Number.parseInt(limit)),
          total_count: count,
          per_page: Number.parseInt(limit),
        },
        query,
      },
    })
  } catch (error) {
    console.error("Search messages error:", error)
    res.status(500).json({
      error: { message: "Failed to search messages" },
    })
  }
})

module.exports = router
