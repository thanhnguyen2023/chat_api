/* eslint-disable no-console */
const express = require("express")
const { Op } = require("sequelize")
const { User, UserContact, BlockedUser, Conversation, Participant } = require("../models")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get my profile
// router.get("/me", authenticateToken, async (req, res) => {
//   try {
//     res.json({ data: req.user })
//   } catch (error) {
//     console.error("Get profile error:", error)
//     res.status(500).json({ error: { message: "Failed to get profile" } })
//   }
// })

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Followers count
    const followersCount = await UserContact.count({
      where: { friend_id: userId }
    })

    // Following count
    const followingCount = await UserContact.count({
      where: { user_id: userId }
    })

    const blockedCount = await BlockedUser.count({
      where: { user_id: userId }
    })

    const following = await UserContact.findAll({
      where: { user_id: userId }
    })
    const followers = await UserContact.findAll({
      where: { friend_id: userId }
    })

    const followingIds = new Set(following.map(f => f.friend_id))
    const followerIds = new Set(followers.map(f => f.user_id))
    const mutualCount = [...followingIds].filter(id => followerIds.has(id)).length
    const stats = {
      followers: followersCount,
      following: followingCount,
      mutual_friends: mutualCount,
      blocked: blockedCount
    }
    console.log("Stats before res.json:")

    console.log("Stats:", stats)
    res.json({
      data: {
        user,
        stats
      }
    })
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
      attributes: { exclude: ["password"] }
    })

    res.json({
      message: "Profile updated successfully",
      data: updatedUser
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
      user_id: { [Op.ne]: req.user.user_id } // Exclude current user
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
        attributes: ["blocked_user_id"]
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
      order: [["username", "ASC"]]
    })

    res.json({
      data: {
        users,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(count / Number.parseInt(limit)),
          total_count: count,
          per_page: Number.parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({
      error: { message: "Failed to get users" }
    })
  }
})

// Lấy danh sách người follow mình
router.get("/followers", authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      include: [{ model: User, as: "Followers", attributes: ["user_id", "username", "avatar_url"] }]
    })
    res.json(user.Followers)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error" })
  }
})

// Lấy danh sách bạn bè
router.get("/friends", authenticateToken, async (req, res) => {
  const userId = req.user.user_id
  try {
    const following = await UserContact.findAll({
      where: { user_id: userId },
      attributes: ["friend_id"]
    })

    const followingIds = following.map(f => f.friend_id)
    if (followingIds.length === 0) return res.json([])

    const mutual = await UserContact.findAll({
      where: {
        user_id: followingIds,
        friend_id: userId
      },
      attributes: ["user_id"]
    })

    const mutualIds = mutual.map(m => m.user_id)
    if (mutualIds.length === 0) return res.json([])

    const friends = await User.findAll({
      where: { user_id: mutualIds },
      attributes: ["user_id", "username", "avatar_url"]
    })

    res.json(friends)
  } catch (err) {
    console.error("Friends error:", err)
    res.status(500).json({ error: "Server error" })
  }
})

//danh sách đề xuất bạn bè
router.get("/suggestions", authenticateToken, async (req, res) => {
  const userId = req.user.user_id

  try {
    // Nếu có view_all=true thì bỏ phân trang
    const viewAll = req.query.view_all === "true"

    const page = parseInt(req.query.page) || 1
    const limit = viewAll ? null : parseInt(req.query.limit) || 20
    const offset = limit ? (page - 1) * limit : 0

    const following = await UserContact.findAll({
      where: { user_id: userId },
      attributes: ["friend_id"]
    })

    const followingIds = following.map((f) => f.friend_id)
    if (followingIds.length === 0) {
      return res.json({
        data: { suggestions: [], pagination: { current_page: 1, total_pages: 0, total_count: 0, per_page: limit || "all" } }
      })
    }

    const friendsOfFollowing = await UserContact.findAll({
      where: { user_id: followingIds },
      attributes: ["friend_id"]
    })

    const candidateIds = friendsOfFollowing.map((f) => f.friend_id)

    const excludeIds = [userId, ...followingIds]
    const uniqueCandidateIds = [...new Set(candidateIds)].filter(
      (id) => !excludeIds.includes(id)
    )

    if (uniqueCandidateIds.length === 0) {
      return res.json({
        data: { suggestions: [], pagination: { current_page: 1, total_pages: 0, total_count: 0, per_page: limit || "all" } }
      })
    }

    const totalCount = uniqueCandidateIds.length
    const totalPages = limit ? Math.ceil(totalCount / limit) : 1
    const paginatedIds = limit
      ? uniqueCandidateIds.slice(offset, offset + limit)
      : uniqueCandidateIds

    const suggestions = await User.findAll({
      where: { user_id: paginatedIds },
      attributes: ["user_id", "username", "full_name", "avatar_url"]
    })

    res.json({
      data: {
        suggestions,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          per_page: limit || "all"
        }
      }
    })
  } catch (err) {
    console.error("Suggestions error:", err)
    res.status(500).json({ error: "Failed to fetch friend suggestions" })
  }
})


// Get user by ID
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params
    const myId = req.user.user_id

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] }
    })

    if (!user) {
      return res.status(404).json({
        error: { message: "User not found" }
      })
    }

    // Check mình có follow họ không
    const isFollowing = await UserContact.count({
      where: { user_id: myId, friend_id: userId }
    })

    const followers = await UserContact.count({
      where: { friend_id: userId }
    })

    const following = await UserContact.count({
      where: { user_id: userId }
    })

    const myFollowing = await UserContact.findAll({
      where: { user_id: myId },
      attributes: ["friend_id"]
    })

    const theirFollowing = await UserContact.findAll({
      where: { user_id: userId },
      attributes: ["friend_id"]
    })
        // 3️⃣ Tìm conversation_id 1-1 giữa 2 người
    const myConversations = await Participant.findAll({
      attributes: ["conversation_id"],
      include: [
        {
          model: Conversation,
          as: "conversation",
          attributes: [],
          where: { is_group: false }
        }
      ],
      where: { user_id: req.user.user_id }
    })
    const conversationIds = myConversations.map(p => p.conversation_id)
        const shared = await Participant.findOne({
      where: {
        user_id: userId,
        conversation_id: { [Op.in]: conversationIds }
      }
    })
    const conversationId = shared ? shared.conversation_id : null

    const myList = myFollowing.map(x => x.friend_id)
    const theirList = theirFollowing.map(x => x.friend_id)

    const mutualCount = myList.filter(id => theirList.includes(id)).length

    let userData = user.toJSON()

    // Check private account
    if (user.is_private && myId !== Number(userId)) {
      const isFriend = await UserContact.findOne({
        where: {
          user_id: myId,
          friend_id: userId
        }
      })

      if (!isFriend) {
        userData = {
          user_id: user.user_id,
          username: user.username,
          avatar_url: user.avatar_url,
          status: user.status,
          is_private: true
        }
      }
    }

    res.json({
      data: {
        user: userData,
        stats: {
          followers,
          following,
          mutual_friends: mutualCount,
        },
        conversation_id: conversationId,
        is_following: isFollowing > 0   // 👈 THÊM TRƯỜNG NÀY
      }
    })

  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      error: { message: "Failed to get user" }
    })
  }
})


// Get user contacts/friends (loại bỏ phân trang của nhánh HEAD)
router.get("/me/contacts", authenticateToken, async (req, res) => {
  try {
    const contacts = await UserContact.findAll({
      where: { user_id: req.user.user_id },
      include: [
        {
          model: User,
          as: "friend",
          attributes: { exclude: ["password"] }
        }
      ],
      order: [["created_at", "DESC"]]
    })

    res.json({
      data: contacts.map((contact) => ({
        contact_id: contact.contact_id,
        friend: contact.friend,
        created_at: contact.created_at
      }))
    })
  } catch (error) {
    console.error("Get contacts error:", error)
    res.status(500).json({
      error: { message: "Failed to get contacts" }
    })
  }
})

// Add user to contacts
router.post("/me/contacts/:friendId", authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params

    // Check if friend exists
    const friend = await User.findByPk(friendId)
    if (!friend) {
      return res.status(404).json({
        error: { message: "User not found" }
      })
    }

    // Cannot follow yourself
    if (Number.parseInt(friendId) === req.user.user_id) {
      return res.status(400).json({
        error: { message: "Cannot follow yourself" }
      })
    }

    // Check if already follow
    const existingContact = await UserContact.findOne({
      where: {
        user_id: req.user.user_id,
        friend_id: friendId
      }
    })

    if (existingContact) {
      return res.status(409).json({
        error: { message: "Already following this user" }
      })
    }

    // Block check
    const isBlocked = await BlockedUser.findOne({
      where: {
        [Op.or]: [
          { user_id: req.user.user_id, blocked_user_id: friendId },
          { user_id: friendId, blocked_user_id: req.user.user_id }
        ]
      }
    })

    if (isBlocked) {
      return res.status(403).json({
        error: { message: "Cannot follow blocked user" }
      })
    }

    // FOLLOW USER
    const contact = await UserContact.create({
      user_id: req.user.user_id,
      friend_id: friendId
    })

    // Count followers of friendId
    const followersCount = await UserContact.count({
      where: { friend_id: friendId }
    })

    res.status(201).json({
      message: "Followed successfully",
      follower_count: followersCount,  // 👈 TRẢ VỀ SỐ FOLLOWER
      data: { contact_id: contact.contact_id }
    })

  } catch (error) {
    console.error("Add contact (follow) error:", error)
    res.status(500).json({
      error: { message: "Failed to follow user" }
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
        friend_id: friendId
      }
    })

    if (!contact) {
      return res.status(404).json({
        error: { message: "Contact not found" }
      })
    }

    await contact.destroy()

    res.json({
      message: "Contact removed successfully"
    })
  } catch (error) {
    console.error("Remove contact error:", error)
    res.status(500).json({
      error: { message: "Failed to remove contact" }
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
        error: { message: "User not found" }
      })
    }

    // Check if user is trying to block themselves
    if (Number.parseInt(userId) === req.user.user_id) {
      return res.status(400).json({
        error: { message: "Cannot block yourself" }
      })
    }

    // Check if already blocked
    const existingBlock = await BlockedUser.findOne({
      where: {
        user_id: req.user.user_id,
        blocked_user_id: userId
      }
    })

    if (existingBlock) {
      return res.status(409).json({
        error: { message: "User already blocked" }
      })
    }

    // Block user
    await BlockedUser.create({
      user_id: req.user.user_id,
      blocked_user_id: userId
    })

    // Remove from contacts if exists
    await UserContact.destroy({
      where: {
        [Op.or]: [
          { user_id: req.user.user_id, friend_id: userId },
          { user_id: userId, friend_id: req.user.user_id }
        ]
      }
    })

    res.status(201).json({
      message: "User blocked successfully"
    })
  } catch (error) {
    console.error("Block user error:", error)
    res.status(500).json({
      error: { message: "Failed to block user" }
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
        blocked_user_id: userId
      }
    })

    if (!blockedUser) {
      return res.status(404).json({
        error: { message: "User not blocked" }
      })
    }

    await blockedUser.destroy()

    res.json({
      message: "User unblocked successfully"
    })
  } catch (error) {
    console.error("Unblock user error:", error)
    res.status(500).json({
      error: { message: "Failed to unblock user" }
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
          attributes: { exclude: ["password"] }
        }
      ],
      limit: Number.parseInt(limit),
      offset,
      order: [["created_at", "DESC"]]
    })

    res.json({
      data: {
        blocked_users: blockedUsers.map((bu) => ({
          block_id: bu.block_id,
          user: bu.blockedUser,
          blocked_at: bu.created_at
        })),
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(count / Number.parseInt(limit)),
          total_count: count,
          per_page: Number.parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error("Get blocked users error:", error)
    res.status(500).json({
      error: { message: "Failed to get blocked users" }
    })
  }
})

// Api lấy danh bạ người dùng
router.post("/suggestions/contacts", authenticateToken, async (req, res) => {
  try {
    // Client gửi lên một mảng các số điện thoại cần tìm
    const { phone_numbers } = req.body

    if (!Array.isArray(phone_numbers) || phone_numbers.length === 0) {
      return res.status(400).json({
        error: { message: "List of phone numbers is required." }
      })
    }

    const userId = req.user.user_id

    // 1. Lấy danh sách ID bạn bè hiện tại của user để loại trừ
    const existingContacts = await UserContact.findAll({
      where: { user_id: userId },
      attributes: ["friend_id"]
    })
    const existingFriendIds = existingContacts.map((c) => c.friend_id)

    // 2. Tìm kiếm users khớp với danh sách SĐT CÓ ĐĂNG KÝ
    const usersFound = await User.findAll({
      where: {
        phone_number: { [Op.in]: phone_numbers }, // SĐT nằm trong danh sách gửi lên
        user_id: { [Op.ne]: userId }, // Loại trừ chính mình
        [Op.and]: [
          { user_id: { [Op.notIn]: existingFriendIds } } // Loại trừ những người đã là bạn
        ]
      },
      // Chỉ lấy thông tin cần thiết, loại bỏ password và các trường không liên quan
      attributes: ["user_id", "username", "full_name", "avatar_url", "status", "phone_number"]
    })

    // 3. Chuẩn bị dữ liệu trả về: ánh xạ từng SĐT đã gửi lên với user tìm được
    const result = phone_numbers.map((number) => {
      // Tìm user tương ứng với SĐT trong kết quả
      const foundUser = usersFound.find(user => user.phone_number === number)

      // Trả về cả SĐT và thông tin user nếu tìm thấy
      if (foundUser) {
        return {
          phone_number: number,
          is_registered: true,
          user: foundUser.toJSON()
        }
      }

      // Nếu không tìm thấy user, báo là chưa đăng ký
      return {
        phone_number: number,
        is_registered: false,
        user: null
      }
    })

    res.json({
      message: "Phone contacts synced successfully",
      data: result
    })

  } catch (error) {
    console.error("Sync contacts error:", error)
    res.status(500).json({
      error: { message: "Failed to sync contacts" }
    })
  }
})


module.exports = router
