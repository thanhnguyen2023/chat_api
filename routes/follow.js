const express = require('express');
const router = express.Router();
const { Follow, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// Follow một người
router.post('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.user_id;

  if (parseInt(userId) === followerId) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  try {
    const [follow, created] = await Follow.findOrCreate({
      where: { follower_id: followerId, following_id: userId }
    });

    if (!created) {
      return res.status(400).json({ message: "Already following" });
    }

    res.json({ message: "Followed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Unfollow một người
router.delete('/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const followerId = req.user.user_id;

  try {
    const result = await Follow.destroy({
      where: { follower_id: followerId, following_id: userId }
    });

    if (result === 0) return res.status(400).json({ message: "Not following" });

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Lấy danh sách người mà user đang follow
router.get('/following', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      include: [{ model: User, as: 'Followings', attributes: ['user_id', 'username', 'avatar_url'] }]
    });
    res.json(user.Followings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

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
    // Lấy tất cả những người mình follow
    const following = await Follow.findAll({
      where: { follower_id: userId },
      attributes: ['following_id']
    });

    const followingIds = following.map(f => f.following_id);

    if (followingIds.length === 0) return res.json([]);

    // Lấy những người trong danh sách trên cũng follow lại mình
    const mutual = await Follow.findAll({
      where: {
        follower_id: followingIds,
        following_id: userId
      },
      attributes: ['follower_id']
    });

    const mutualIds = mutual.map(m => m.follower_id);

    if (mutualIds.length === 0) return res.json([]);

    // Lấy thông tin user của mutual friends
    const friends = await User.findAll({
      where: { user_id: mutualIds },
      attributes: ['user_id', 'username', 'avatar_url']
    });

    res.json(friends);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
