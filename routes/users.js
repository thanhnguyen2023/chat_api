const express = require("express")
const { Op } = require("sequelize")
const { User, UserContact, BlockedUser } = require("../models")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get my profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    res.json({ data: req.user }) 
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: { message: "Failed to get profile" } })
  }
})

// Update my profile
router.put("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id
    const { username, email, avatar_url, status, full_name, gender, is_private, bio } = req.body

    await User.update(
      { username, email, avatar_url, status, full_name, gender, is_private, bio },
      { where: { user_id: userId } }
)


    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    })

    res.json({
      message: "Profile updated successfully",
      data: updatedUser,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ error: { message: "Failed to update profile" } })
  }
})

// Get all users (with search and pagination)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20, status, exclude_blocked = true } = req.query

    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const whereClause = {
      user_id: { [Op.ne]: req.user.user_id }, // Exclude current user
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [{ username: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }]
    }

    // Add status filter
    if (status) {
      whereClause.status = status
    }

    // Get blocked users if exclude_blocked is true
    let blockedUserIds = []
    if (exclude_blocked === "true") {
      const blockedUsers = await BlockedUser.findAll({
        where: { user_id: req.user.user_id },
        attributes: ["blocked_user_id"],
      })
      blockedUserIds = blockedUsers.map((bu) => bu.blocked_user_id)

      if (blockedUserIds.length > 0) {
        whereClause.user_id[Op.notIn] = blockedUserIds
      }
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      limit: Number.parseInt(limit),
      offset,
      order: [["username", "ASC"]],
    })

    res.json({
      data: {
        users,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(count / Number.parseInt(limit)),
          total_count: count,
          per_page: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      error: { message: "Failed to get users" },
    })
  }
})

// Lấy danh sách người follow mình
router.get('/followers', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      include: [{ model: User, as: 'Followers', attributes: ['user_id', 'username', 'avatar_url'] }]
    });
    res.json(user.Followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Lấy danh sách bạn bè 
router.get('/friends', authenticateToken, async (req, res) => {
  const userId = req.user.user_id;
  try {
    const following = await UserContact.findAll({
      where: { user_id: userId },
      attributes: ['friend_id'],
    });

    const followingIds = following.map(f => f.friend_id);
    if (followingIds.length === 0) return res.json([]);

    const mutual = await UserContact.findAll({
      where: {
        user_id: followingIds,
        friend_id: userId,
      },
      attributes: ['user_id'],
    });

    const mutualIds = mutual.map(m => m.user_id);
    if (mutualIds.length === 0) return res.json([]);

    const friends = await User.findAll({
      where: { user_id: mutualIds },
      attributes: ['user_id', 'username', 'avatar_url'],
    });

    res.json(friends);
  } catch (err) {
    console.error('Friends error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//danh sách đề xuất bạn bè
router.get("/suggestions", authenticateToken, async (req, res) => {
  const userId = req.user.user_id;

  try {
    // Nếu có view_all=true thì bỏ phân trang
    const viewAll = req.query.view_all === "true";

    const page = parseInt(req.query.page) || 1;
    const limit = viewAll ? null : parseInt(req.query.limit) || 20;
    const offset = limit ? (page - 1) * limit : 0;

    const following = await UserContact.findAll({
      where: { user_id: userId },
      attributes: ["friend_id"],
    });

    const followingIds = following.map((f) => f.friend_id);
    if (followingIds.length === 0) {
      return res.json({
        data: { suggestions: [], pagination: { current_page: 1, total_pages: 0, total_count: 0, per_page: limit || "all" } },
      });
    }

    const friendsOfFollowing = await UserContact.findAll({
      where: { user_id: followingIds },
      attributes: ["friend_id"],
    });

    const candidateIds = friendsOfFollowing.map((f) => f.friend_id);

    const excludeIds = [userId, ...followingIds];
    const uniqueCandidateIds = [...new Set(candidateIds)].filter(
      (id) => !excludeIds.includes(id)
    );

    if (uniqueCandidateIds.length === 0) {
      return res.json({
        data: { suggestions: [], pagination: { current_page: 1, total_pages: 0, total_count: 0, per_page: limit || "all" } },
      });
    }

    const totalCount = uniqueCandidateIds.length;
    const totalPages = limit ? Math.ceil(totalCount / limit) : 1;
    const paginatedIds = limit
      ? uniqueCandidateIds.slice(offset, offset + limit)
      : uniqueCandidateIds;

    const suggestions = await User.findAll({
      where: { user_id: paginatedIds },
      attributes: ["user_id", "username", "full_name", "avatar_url"],
    });

    res.json({
      data: {
        suggestions,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          per_page: limit || "all",
        },
      },
    });
  } catch (err) {
    console.error("Suggestions error:", err);
    res.status(500).json({ error: "Failed to fetch friend suggestions" });
  }
});


// Get user by ID
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(404).json({
        error: { message: "User not found" },
      })
    }

    // Check if user is blocked
    const isBlocked = await BlockedUser.findOne({
      where: {
        user_id: req.user.user_id,
        blocked_user_id: userId,
      },
    })

    res.json({
      data: {
        user: user.toJSON(),
        is_blocked: !!isBlocked,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      error: { message: "Failed to get user" },
    })
  }
})

//danh sách mình theo dõi
router.get("/me/contacts", authenticateToken, async (req, res) => {
  try {
    const contacts = await UserContact.findAll({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: User,
          as: "friend",
          attributes: { exclude: ["password"] },
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      data: contacts.map((contact) => ({
        contact_id: contact.contact_id,
        friend: contact.friend,
        created_at: contact.created_at,
      })),
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      error: { message: "Failed to get contacts" },
    });
  }
});

// Add user to contacts
router.post("/me/contacts/:friendId", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params

    // Check if friend exists
    const friend = await User.findByPk(friendId)
    if (!friend) {
      return res.status(404).json({
        error: { message: "User not found" },
      })
    }

    // Check if user is trying to add themselves
    if (Number.parseInt(friendId) === req.user.user_id) {
      return res.status(400).json({
        error: { message: "Cannot add yourself as a contact" },
      })
    }

    // Check if already in contacts
    const existingContact = await UserContact.findOne({
      where: {
        user_id: req.user.user_id,
        friend_id: friendId,
      },
    })

    if (existingContact) {
      return res.status(409).json({
        error: { message: "User already in contacts" },
      })
    }

    // Check if user is blocked
    const isBlocked = await BlockedUser.findOne({
      where: {
        [Op.or]: [
          { user_id: req.user.user_id, blocked_user_id: friendId },
          { user_id: friendId, blocked_user_id: req.user.user_id },
        ],
      },
    })

    if (isBlocked) {
      return res.status(403).json({
        error: { message: "Cannot add blocked user to contacts" },
      })
    }

    // Add to contacts
    const contact = await UserContact.create({
      user_id: req.user.user_id,
      friend_id: friendId,
    })

    res.status(201).json({
      message: "Contact added successfully",
      data: { contact_id: contact.contact_id },
    })
  } catch (error) {
    console.error("Add contact error:", error)
    res.status(500).json({
      error: { message: "Failed to add contact" },
    })
  }
})

// Remove user from contacts
router.delete("/me/contacts/:friendId", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params

    const contact = await UserContact.findOne({
      where: {
        user_id: req.user.user_id,
        friend_id: friendId,
      },
    })

    if (!contact) {
      return res.status(404).json({
        error: { message: "Contact not found" },
      })
    }

    await contact.destroy()

    res.json({
      message: "Contact removed successfully",
    })
  } catch (error) {
    console.error("Remove contact error:", error)
    res.status(500).json({
      error: { message: "Failed to remove contact" },
    })
  }
})

// Block user
router.post("/me/blocked/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params

    // Check if user exists
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        error: { message: "User not found" },
      })
    }

    // Check if user is trying to block themselves
    if (Number.parseInt(userId) === req.user.user_id) {
      return res.status(400).json({
        error: { message: "Cannot block yourself" },
      })
    }

    // Check if already blocked
    const existingBlock = await BlockedUser.findOne({
      where: {
        user_id: req.user.user_id,
        blocked_user_id: userId,
      },
    })

    if (existingBlock) {
      return res.status(409).json({
        error: { message: "User already blocked" },
      })
    }

    // Block user
    await BlockedUser.create({
      user_id: req.user.user_id,
      blocked_user_id: userId,
    })

    // Remove from contacts if exists
    await UserContact.destroy({
      where: {
        [Op.or]: [
          { user_id: req.user.user_id, friend_id: userId },
          { user_id: userId, friend_id: req.user.user_id },
        ],
      },
    })

    res.status(201).json({
      message: "User blocked successfully",
    })
  } catch (error) {
    console.error("Block user error:", error)
    res.status(500).json({
      error: { message: "Failed to block user" },
    })
  }
})

// Unblock user
router.delete("/me/blocked/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params

    const blockedUser = await BlockedUser.findOne({
      where: {
        user_id: req.user.user_id,
        blocked_user_id: userId,
      },
    })

    if (!blockedUser) {
      return res.status(404).json({
        error: { message: "User not blocked" },
      })
    }

    await blockedUser.destroy()

    res.json({
      message: "User unblocked successfully",
    })
  } catch (error) {
    console.error("Unblock user error:", error)
    res.status(500).json({
      error: { message: "Failed to unblock user" },
    })
  }
})

// Get blocked users
router.get("/me/blocked", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const { count, rows: blockedUsers } = await BlockedUser.findAndCountAll({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: User,
          as: "blockedUser",
          attributes: { exclude: ["password"] },
        },
      ],
      limit: Number.parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    })

    res.json({
      data: {
        blocked_users: blockedUsers.map((bu) => ({
          block_id: bu.block_id,
          user: bu.blockedUser,
          blocked_at: bu.created_at,
        })),
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(count / Number.parseInt(limit)),
          total_count: count,
          per_page: Number.parseInt(limit),
        },
      },
    })
  } catch (error) {
    console.error("Get blocked users error:", error)
    res.status(500).json({
      error: { message: "Failed to get blocked users" },
    })
  }
})

module.exports = router
