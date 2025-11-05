const {
  sequelize,
  Post,
  PostLike,
  PostComment,
  PostSave,
  PostMedia,
  User
} = require("../models")

const nestComments = (comments, parentId = null) => {
  const nestedComments = []

  for (const comment of comments) {
    if (comment.parent_comment_id === parentId) {
      // Tìm tất cả bình luận con của bình luận hiện tại
      const children = nestComments(comments, comment.comment_id)

      // Nếu có bình luận con, thêm mảng 'children' vào đối tượng comment
      if (children.length) {
        comment.children = children
      }

      // Thêm bình luận đã được xử lý (có thể có con) vào mảng kết quả
      nestedComments.push(comment)
    }
  }

  return nestedComments
}

/**
 * Tạo bài viết mới (chỉ caption/location)
 */
const createPost = async (user_id, postData) => {
  try {
    const newPost = await Post.create({
      user_id,
      caption: postData.caption,
      location: postData.location
    })

    return Post.findByPk(newPost.post_id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["user_id", "username", "avatar_url"]
        }
      ]
    })
  } catch (error) {
    console.error("Error creating post:", error)
    throw new Error("Could not create post.")
  }
}

/**
 * Thích hoặc bỏ thích một bài viết
 */
const toggleLikePost = async (user_id, post_id) => {
  const existingLike = await PostLike.findOne({
    where: { user_id, post_id }
  })

  if (existingLike) {
    await existingLike.destroy()
    return { liked: false, message: "Post unliked." }
  } else {
    await PostLike.create({ user_id, post_id })
    return { liked: true, message: "Post liked." }
  }
}

/**
 * Thêm bình luận vào bài viết
 */
const addComment = async (user_id, post_id, commentData) => {
  const newComment = await PostComment.create({
    user_id,
    post_id,
    content: commentData.content,
    parent_comment_id: commentData.parent_comment_id || null
  })

  return PostComment.findByPk(newComment.comment_id, {
    include: [
      {
        model: User,
        as: "commenter",
        attributes: ["user_id", "username", "avatar_url"]
      }
    ]
  })
}

/**
 * Lưu hoặc bỏ lưu bài viết
 */
const toggleSavePost = async (user_id, post_id) => {
  const existingSave = await PostSave.findOne({
    where: { user_id, post_id }
  })

  if (existingSave) {
    await existingSave.destroy()
    return { saved: false, message: "Post unsaved." }
  } else {
    await PostSave.create({ user_id, post_id })
    return { saved: true, message: "Post saved." }
  }
}

/**
 * Lấy chi tiết một bài viết
 */
const getPostDetails = async (user_id, post_id) => {
  const PostData = await Post.findByPk(post_id, {
    attributes: {
      include: [
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = Post.post_id)"
          ),
          "likesCount"
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = Post.post_id)"
          ),
          "commentsCount"
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM post_saves WHERE post_saves.post_id = Post.post_id)"
          ),
          "saveCount"
        ]
      ]
    },
    include: [
      {
        model: User,
        as: "author",
        attributes: ["user_id", "username", "avatar_url"]
      },
      {
        model: PostMedia,
        as: "media",
        attributes: ["media_id", "media_url", "media_type", "order_index"]
      }
    ],
    order: [
      [{ model: PostMedia, as: "media" }, "order_index", "ASC"]
    ]
  })

  if (!PostData) return null

  // Lấy tất cả bình luận của bài viết này (dạng phẳng)
  const rawComments = await PostComment.findAll({
    where: { post_id: post_id },
    include: [
      {
        model: User,
        as: "commenter",
        attributes: ["user_id", "username", "avatar_url"]
      }
    ],
    attributes: ["comment_id", "user_id", "post_id", "parent_comment_id", "content", "created_at"],
    order: [["created_at", "ASC"]]
  })

  // Lồng ghép bình luận
  const nestedComments = nestComments(rawComments.map(c => c.get({ plain: true })))

  // Kiểm tra trạng thái lưu
  const isSaved = await PostSave.findOne({ where: { user_id, post_id } })

  return {
    ...PostData.get({ plain: true }),
    // Ghi đè comments bằng cấu trúc lồng ghép mới
    comments: nestedComments,
    isSaved: Boolean(isSaved)
  }
}

const updatePost = async (user_id, post_id, updateData) => {
  const post = await Post.findByPk(post_id)

  if (!post) {
    throw new Error("Post not found.")
  }

  // Kiểm tra quyền: Chỉ tác giả mới được sửa
  if (post.user_id !== user_id) {
    throw new Error("Unauthorized to update this post.")
  }

  // Cập nhật bài viết
  await post.update(updateData)

  // Trả về bài viết đã được cập nhật
  return post
}

const updateComment = async (user_id, comment_id, updateData) => {
  const comment = await PostComment.findByPk(comment_id)

  if (!comment) {
    throw new Error("Comment not found.")
  }

  // Kiểm tra quyền: Chỉ tác giả comment mới được sửa
  if (comment.user_id !== user_id) {
    throw new Error("Unauthorized to update this comment.")
  }

  // Cập nhật bình luận
  await comment.update({ content: updateData.content })

  // Trả về bình luận đã được cập nhật cùng với thông tin người bình luận
  const updatedComment = await PostComment.findByPk(comment_id, {
    include: [
      {
        model: User,
        as: "commenter",
        attributes: ["user_id", "username", "avatar_url"]
      }
    ]
  })

  return updatedComment
}

const updatePostMedia = async (user_id, post_id, mediaData) => {
  const post = await Post.findByPk(post_id)

  if (!post) {
    throw new Error("Post not found.")
  }

  // Kiểm tra quyền: Chỉ tác giả mới được sửa
  if (post.user_id !== user_id) {
    throw new Error("Unauthorized to update media for this post.")
  }

  // Bắt đầu Transaction để đảm bảo tính toàn vẹn dữ liệu
  await sequelize.transaction(async (t) => {
    // Xóa tất cả media cũ của bài viết
    await PostMedia.destroy({
      where: { post_id: post_id },
      transaction: t
    })

    // Thêm mới danh sách media được gửi lên
    const mediaToCreate = mediaData.media.map((media, index) => ({
      post_id: post_id,
      media_url: media.media_url,
      media_type: media.media_type,
      order_index: media.order_index || index + 1
    }))

    await PostMedia.bulkCreate(mediaToCreate, { transaction: t })
  })

  // Trả về bài viết đã được cập nhật (bao gồm cả media mới)
  const updatedPost = await Post.findByPk(post_id, {
    include: [{ model: PostMedia, as: "media" }]
  })

  return updatedPost
}

const deletePost = async (user_id, post_id) => {
  const post = await Post.findByPk(post_id)

  if (!post) {
    return { success: false, message: "Post not found." }
  }

  // Chỉ tác giả bài viết mới có thể xóa
  if (post.user_id !== user_id) {
    return { success: false, message: "Unauthorized to delete this post." }
  }

  await post.destroy()

  return { success: true, message: "Post deleted successfully." }
}

const deleteComment = async (user_id, post_id, comment_id) => {
  const comment = await PostComment.findOne({
    where: { comment_id, post_id }
  })

  if (!comment) {
    return { success: false, message: "Comment not found." }
  }

  // Tìm bài viết để xác định tác giả bài viết
  const post = await Post.findByPk(post_id, { attributes: ["user_id"] })

  // Điều kiện kiểm tra quyền
  const isCommentAuthor = comment.user_id === user_id
  const isPostAuthor = post && post.user_id === user_id

  // Chỉ tác giả comment hoặc tác giả bài viết mới có thể xóa comment
  if (!isCommentAuthor && !isPostAuthor) {
    return { success: false, message: "Unauthorized to delete this comment." }
  }

  // Xóa bình luận (sẽ tự động xóa các bình luận con nhờ FK parent_comment_id ON DELETE CASCADE)
  await comment.destroy()

  return { success: true, message: "Comment deleted successfully." }
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
  deleteComment
}

