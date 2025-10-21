const express = require("express")
const { Op } = require("sequelize")
const { Notification, User } = require("../models")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get notifications for current user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, is_seen } = req.query
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const whereClause = { user_id: req.user.user_id }

    // Filter by seen status if provided
    if (is_seen !== undefined) {
      whereClause.is_seen = is_seen === "true"
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      limit: Number.parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["user_id", "username", "avatar_url"],
          required: false,
        },
      ],
    })

    res.json({
      data: {
        notifications,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(count / Number.parseInt(limit)),
          total_count: count,
          per_page: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({
      error: { message: "Failed to get notifications" },
    })
  }
})

// Create notification (internal use)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { user_id, actor_id, type, content, reference_type, reference_id } = req.body

    // Validate input
    if (!user_id || !type || !content) {
      return res.status(400).json({
        error: { message: "user_id, type, and content are required" },
      })
    }

    // Check if target user exists
    const user = await User.findByPk(user_id)
    if (!user) {
      return res.status(404).json({
        error: { message: "User not found" },
      })
    }

    // Check if actor exists (if provided)
    if (actor_id) {
      const actor = await User.findByPk(actor_id)
      if (!actor) {
        return res.status(404).json({
          error: { message: "Actor not found" },
        })
      }
    }

    const notification = await Notification.create({
      user_id,
      actor_id: actor_id || null,
      type,
      content,
      reference_type: reference_type || null,
      reference_id: reference_id || null,
    })

    res.status(201).json({
      message: "Notification created successfully",
      data: { notification },
    })
  } catch (error) {
    console.error("Create notification error:", error)
    res.status(500).json({
      error: { message: "Failed to create notification" },
    })
  }
})

// Mark notification as seen
router.patch("/:notificationId/seen", authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findOne({
      where: {
        notification_id: notificationId,
        user_id: req.user.user_id,
      },
    })

    if (!notification) {
      return res.status(404).json({
        error: { message: "Notification not found" },
      })
    }

    await notification.update({ is_seen: true })

    res.json({
      message: "Notification marked as seen",
      data: { notification },
    })
  } catch (error) {
    console.error("Mark notification as seen error:", error)
    res.status(500).json({
      error: { message: "Failed to mark notification as seen" },
    })
  }
})

// Mark all notifications as seen
router.patch("/mark-all-seen", authenticateToken, async (req, res) => {
  try {
    const [updatedCount] = await Notification.update(
      { is_seen: true },
      {
        where: {
          user_id: req.user.user_id,
          is_seen: false,
        },
      },
    )

    res.json({
      message: "All notifications marked as seen",
      data: { updated_count: updatedCount },
    })
  } catch (error) {
    console.error("Mark all notifications as seen error:", error)
    res.status(500).json({
      error: { message: "Failed to mark all notifications as seen" },
    })
  }
})

// Delete notification
router.delete("/:notificationId", authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findOne({
      where: {
        notification_id: notificationId,
        user_id: req.user.user_id,
      },
    })

    if (!notification) {
      return res.status(404).json({
        error: { message: "Notification not found" },
      })
    }

    await notification.destroy()

    res.json({
      message: "Notification deleted successfully",
    })
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({
      error: { message: "Failed to delete notification" },
    })
  }
})

// Get unread notification count
router.get("/unread/count", authenticateToken, async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: req.user.user_id,
        is_seen: false,
      },
    })

    res.json({
      data: { unread_count: count },
    })
  } catch (error) {
    console.error("Get unread count error:", error)
    res.status(500).json({
      error: { message: "Failed to get unread count" },
    })
  }
})

module.exports = router
