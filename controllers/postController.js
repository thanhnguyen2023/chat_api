const postService = require("../services/postService")

const createPost = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const { caption, location } = req.body

    const postData = { caption, location }
    const newPost = await postService.createPost(user_id, postData)

    res.status(201).json(newPost)
  } catch (error) {
    res.status(500).json({ error: { message: error.message } })
  }
}

const toggleLikePost = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const post_id = req.params.postId
    const result = await postService.toggleLikePost(user_id, parseInt(post_id))
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: { message: error.message } })
  }
}

const addComment = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const post_id = req.params.postId
    const commentData = req.body
    const newComment = await postService.addComment(
      user_id,
      parseInt(post_id),
      commentData
    )
    res.status(201).json(newComment)
  } catch (error) {
    res.status(500).json({ error: { message: error.message } })
  }
}

const toggleSavePost = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const post_id = req.params.postId
    const result = await postService.toggleSavePost(user_id, parseInt(post_id))
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: { message: error.message } })
  }
}

const getPostDetails = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const post_id = req.params.postId
    const post = await postService.getPostDetails(user_id, parseInt(post_id))
    if (!post) {
      return res.status(404).json({ error: { message: "Post not found." } })
    }
    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ error: { message: error.message } })
  }
}

const updatePost = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const post_id = req.params.postId
    const updateData = req.body

    const updatedPost = await postService.updatePost(
      user_id,
      parseInt(post_id),
      updateData
    )

    res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      post: updatedPost
    })
  } catch (error) {
    if (error.message.includes("Unauthorized") || error.message.includes("not found")) {
      return res.status(403).json({ error: { message: error.message } })
    }
    res.status(500).json({ error: { message: error.message } })
  }
}

const updateComment = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const comment_id = req.params.commentId
    const updateData = req.body

    const updatedComment = await postService.updateComment(
      user_id,
      parseInt(comment_id),
      updateData
    )

    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comment: updatedComment
    })
  } catch (error) {
    if (error.message.includes("Unauthorized") || error.message.includes("not found")) {
      return res.status(403).json({ error: { message: error.message } })
    }
    res.status(500).json({ error: { message: error.message } })
  }
}

const updatePostMedia = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const post_id = parseInt(req.params.postId)
    const mediaData = req.body

    const updatedPost = await postService.updatePostMedia(
      user_id,
      post_id,
      mediaData
    )

    res.status(200).json({
      success: true,
      message: "Post media updated successfully.",
      post: updatedPost
    })
  } catch (error) {
    if (error.message.includes("Unauthorized") || error.message.includes("not found")) {
      return res.status(403).json({ error: { message: error.message } })
    }
    res.status(500).json({ error: { message: error.message } })
  }
}

const deletePost = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const post_id = parseInt(req.params.postId)

    if (isNaN(post_id)) {
      return res.status(400).json({ error: { message: "Invalid Post ID." } })
    }

    const result = await postService.deletePost(user_id, post_id)

    if (result.message === "Post not found.") {
      return res.status(404).json({ error: { message: result.message } })
    }
    if (result.message === "Unauthorized to delete this post.") {
      return res.status(403).json({ error: { message: result.message } })
    }

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: { message: error.message } })
  }
}

// Xóa bình luận
const deleteComment = async (req, res) => {
  try {
    const user_id = req.user.user_id
    const post_id = parseInt(req.params.postId)
    const comment_id = parseInt(req.params.commentId)

    if (isNaN(post_id) || isNaN(comment_id)) {
      return res.status(400).json({ error: { message: "Invalid Post ID or Comment ID." } })
    }

    const result = await postService.deleteComment(user_id, post_id, comment_id)

    if (result.message === "Comment not found.") {
      return res.status(404).json({ error: { message: result.message } })
    }
    if (result.message === "Unauthorized to delete this comment.") {
      return res.status(403).json({ error: { message: result.message } })
    }

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: { message: error.message } })
  }
}

const getShareableLink = async (req, res) => {
  try {
    const post_id = req.params.postId

    const clientBaseUrl = process.env.CLIENT_URL || "http://localhost:3001" 

    const shareableLink = `${clientBaseUrl}/post/${post_id}`

    res.status(200).json({
      success: true,
      message: "Shareable link generated successfully.",
      share_link: shareableLink
    })
  } catch (error) {
    res.status(500).json({ error: { message: error.message } })
  }
}

module.exports = {
  createPost,
  toggleLikePost,
  addComment,
  toggleSavePost,
  getPostDetails,
  updatePost,
  updateComment,
  updatePostMedia,
  deletePost,
  deleteComment,
  getShareableLink
}

