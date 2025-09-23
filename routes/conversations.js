const express = require("express")
const { Op } = require("sequelize")
const { Conversation, Participant, User, Message, GroupSetting, BlockedUser } = require("../models")
const { authenticateToken } = require("../middleware/auth")
const { validate, schemas } = require("../utils/validation")

const router = express.Router()

// Get all conversations for current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Get conversations where user is a participant
    const { count, rows: conversations } = await Conversation.findAndCountAll({
      include: [
        {
          model: Participant,
          as: "participants",
          where: { user_id: req.user.user_id },
          attributes: [],
        },
        {
          model: Participant,
          as: "participants",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "username", "avatar_url", "status"],
            },
          ],
        },
        {
          model: Message,
          as: "messages",
          limit: 1,
          order: [["created_at", "DESC"]],
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["user_id", "username", "avatar_url"],
            },
          ],
        },
      ],
      limit: Number.parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
      distinct: true,
    })

    // Format response
    const formattedConversations = conversations.map((conv) => {
      const lastMessage = conv.messages[0] || null
      return {
        conversation_id: conv.conversation_id,
        conversation_name: conv.conversation_name,
        is_group: conv.is_group,
        created_at: conv.created_at,
        participants: conv.participant.length != 0 ? conv.participants.map((p) => p.user) : conv.participants.user,
        last_message: lastMessage
          ? {
              message_id: lastMessage.message_id,
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              sender: lastMessage.sender,
            }
          : null,
      }
    })

    res.json({
      data: {
        conversations: formattedConversations,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(count / Number.parseInt(limit)),
          total_count: count,
          per_page: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get conversations error:", error)
    res.status(500).json({
      error: { message: "Failed to get conversations" },
    })
  }
})

// Create new conversation
router.post("/", authenticateToken, validate(schemas.createConversation), async (req, res) => {
  try {
    const { conversation_name, is_group, participant_ids } = req.body

    // Validate participants
    if (!participant_ids.includes(req.user.user_id)) {
      participant_ids.push(req.user.user_id)
    }

    // Check if users exist and are not blocked
    const users = await User.findAll({
      where: { user_id: { [Op.in]: participant_ids } },
    })

    if (users.length !== participant_ids.length) {
      return res.status(400).json({
        error: { message: "One or more users not found" },
      })
    }

    // Check for blocked users
    const blockedUsers = await BlockedUser.findAll({
      where: {
        [Op.or]: [
          {
            user_id: req.user.user_id,
            blocked_user_id: { [Op.in]: participant_ids },
          },
          {
            user_id: { [Op.in]: participant_ids },
            blocked_user_id: req.user.user_id,
          },
        ],
      },
    })

    if (blockedUsers.length > 0) {
      return res.status(403).json({
        error: { message: "Cannot create conversation with blocked users" },
      })
    }

    // For direct messages, check if conversation already exists
    if (!is_group && participant_ids.length === 2) {
      const existingConversation = await Conversation.findOne({
        include: [
          {
            model: Participant,
            as: "participants",
            where: { user_id: { [Op.in]: participant_ids } },
            attributes: ["user_id"],
          },
        ],
        where: { is_group: false },
      })

      if (existingConversation) {
        const participantCount = existingConversation.participants.length
        if (participantCount === 2) {
          return res.status(409).json({
            error: { message: "Direct conversation already exists" },
          })
        }
      }
    }

    // Create conversation
    const conversation = await Conversation.create({
      conversation_name: is_group ? conversation_name : null,
      is_group,
    })

    // Add participants
    const participantPromises = participant_ids.map((userId) =>
      Participant.create({
        conversation_id: conversation.conversation_id,
        user_id: userId,
      }),
    )

    await Promise.all(participantPromises)

    // Get conversation with participants
    const createdConversation = await Conversation.findByPk(conversation.conversation_id, {
      include: [
        {
          model: Participant,
          as: "participants",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "username", "avatar_url", "status"],
            },
          ],
        },
      ],
    })

    res.status(201).json({
      message: "Conversation created successfully",
      data: {
        conversation: {
          conversation_id: createdConversation.conversation_id,
          conversation_name: createdConversation.conversation_name,
          is_group: createdConversation.is_group,
          created_at: createdConversation.created_at,
          participants: createdConversation.participants.map((p) => p.user),
        },
      },
    })
  } catch (error) {
    console.error("Create conversation error:", error)
    res.status(500).json({
      error: { message: "Failed to create conversation" },
    })
  }
})

// Get conversation by ID
router.get("/:conversationId", authenticateToken, async (req, res) => {
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

    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        {
          model: Participant,
          as: "participants",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["user_id", "username", "avatar_url", "status"],
            },
          ],
        },
        {
          model: GroupSetting,
          as: "settings",
        },
      ],
    })

    if (!conversation) {
      return res.status(404).json({
        error: { message: "Conversation not found" },
      })
    }

    res.json({
      data: {
        conversation: {
          conversation_id: conversation.conversation_id,
          conversation_name: conversation.conversation_name,
          is_group: conversation.is_group,
          created_at: conversation.created_at,
          participants: conversation.participants.map((p) => p.user),
          settings: conversation.settings || [],
        },
      },
    })
  } catch (error) {
    console.error("Get conversation error:", error)
    res.status(500).json({
      error: { message: "Failed to get conversation" },
    })
  }
})

// Update conversation (name, settings)
router.put("/:conversationId", authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params
    const { conversation_name } = req.body

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

    const conversation = await Conversation.findByPk(conversationId)

    if (!conversation) {
      return res.status(404).json({
        error: { message: "Conversation not found" },
      })
    }

    // Only allow updating group conversations
    if (!conversation.is_group) {
      return res.status(400).json({
        error: { message: "Cannot update direct message conversation" },
      })
    }

    await conversation.update({ conversation_name })

    res.json({
      message: "Conversation updated successfully",
      data: { conversation },
    })
  } catch (error) {
    console.error("Update conversation error:", error)
    res.status(500).json({
      error: { message: "Failed to update conversation" },
    })
  }
})

// Add participant to group conversation
router.post("/:conversationId/participants", authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params
    const { user_id } = req.body

    // Check if current user is participant
    const currentParticipant = await Participant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: req.user.user_id,
      },
    })

    if (!currentParticipant) {
      return res.status(403).json({
        error: { message: "Access denied to this conversation" },
      })
    }

    const conversation = await Conversation.findByPk(conversationId)

    if (!conversation) {
      return res.status(404).json({
        error: { message: "Conversation not found" },
      })
    }

    if (!conversation.is_group) {
      return res.status(400).json({
        error: { message: "Cannot add participants to direct message" },
      })
    }

    // Check if user exists
    const user = await User.findByPk(user_id)
    if (!user) {
      return res.status(404).json({
        error: { message: "User not found" },
      })
    }

    // Check if user is already participant
    const existingParticipant = await Participant.findOne({
      where: {
        conversation_id: conversationId,
        user_id,
      },
    })

    if (existingParticipant) {
      return res.status(409).json({
        error: { message: "User is already a participant" },
      })
    }

    // Check if user is blocked
    const isBlocked = await BlockedUser.findOne({
      where: {
        [Op.or]: [
          { user_id: req.user.user_id, blocked_user_id: user_id },
          { user_id: user_id, blocked_user_id: req.user.user_id },
        ],
      },
    })

    if (isBlocked) {
      return res.status(403).json({
        error: { message: "Cannot add blocked user to conversation" },
      })
    }

    // Add participant
    await Participant.create({
      conversation_id: conversationId,
      user_id,
    })

    res.status(201).json({
      message: "Participant added successfully",
    })
  } catch (error) {
    console.error("Add participant error:", error)
    res.status(500).json({
      error: { message: "Failed to add participant" },
    })
  }
})

// Remove participant from group conversation
router.delete("/:conversationId/participants/:userId", authenticateToken, async (req, res) => {
  try {
    const { conversationId, userId } = req.params

    // Check if current user is participant
    const currentParticipant = await Participant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: req.user.user_id,
      },
    })

    if (!currentParticipant) {
      return res.status(403).json({
        error: { message: "Access denied to this conversation" },
      })
    }

    const conversation = await Conversation.findByPk(conversationId)

    if (!conversation) {
      return res.status(404).json({
        error: { message: "Conversation not found" },
      })
    }

    if (!conversation.is_group) {
      return res.status(400).json({
        error: { message: "Cannot remove participants from direct message" },
      })
    }

    // Users can only remove themselves or (in future) admins can remove others
    if (Number.parseInt(userId) !== req.user.user_id) {
      return res.status(403).json({
        error: { message: "Can only remove yourself from conversation" },
      })
    }

    const participant = await Participant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
      },
    })

    if (!participant) {
      return res.status(404).json({
        error: { message: "Participant not found" },
      })
    }

    await participant.destroy()

    res.json({
      message: "Participant removed successfully",
    })
  } catch (error) {
    console.error("Remove participant error:", error)
    res.status(500).json({
      error: { message: "Failed to remove participant" },
    })
  }
})

// Delete conversation
router.delete("/:conversationId", authenticateToken, async (req, res) => {
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

    const conversation = await Conversation.findByPk(conversationId)

    if (!conversation) {
      return res.status(404).json({
        error: { message: "Conversation not found" },
      })
    }

    // For now, only allow users to leave conversation (remove themselves)
    // In a full implementation, you might want admin controls for group deletion
    await participant.destroy()

    // If this was the last participant, delete the conversation
    const remainingParticipants = await Participant.count({
      where: { conversation_id: conversationId },
    })

    if (remainingParticipants === 0) {
      await conversation.destroy()
    }

    res.json({
      message: "Left conversation successfully",
    })
  } catch (error) {
    console.error("Delete conversation error:", error)
    res.status(500).json({
      error: { message: "Failed to leave conversation" },
    })
  }
})

module.exports = router
