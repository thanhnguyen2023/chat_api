/* eslint-disable no-console */
const {
  sequelize,
  Post,
  PostLike,
  PostComment,
  PostSave,
  PostMedia,
  User
} = require("../models")

const { Op } = require("sequelize")
const { cleanText } = require("../utils/filter"); 


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
  } else {
    await PostLike.create({ user_id, post_id })
  }
  const [[{ likeCount }]] = await sequelize.query(
    `SELECT COUNT(*) AS likeCount FROM post_likes WHERE post_id = ${post_id}`
  )
  return {
    liked: !existingLike,
    message: existingLike ? "Post unliked." : "Post liked.",
    likeCount: parseInt(likeCount, 10)
  }
}


/**
 * Thêm bình luận vào bài viết
 */
const addComment = async (user_id, post_id, commentData) => {
  const cleanedContent = cleanText(commentData.content);

  const newComment = await PostComment.create({
    user_id,
    post_id,
    content: cleanedContent,
    parent_comment_id: commentData.parent_comment_id || null
  });

  return PostComment.findByPk(newComment.comment_id, {
    include: [
      {
        model: User,
        as: "commenter",
        attributes: ["user_id", "username", "avatar_url"]
      }
    ]
  });
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
          "commentCount"
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
  const [isSaved, isLiked] = await Promise.all([
    PostSave.findOne({ where: { user_id, post_id } }),
    PostLike.findOne({ where: { user_id, post_id } })
  ])
  return {
    ...PostData.get({ plain: true }),
    // Ghi đè comments bằng cấu trúc lồng ghép mới
    comments: nestedComments,
    isSaved: Boolean(isSaved),
    isLiked: Boolean(isLiked)

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

const getFeedPosts = async (userId, page = 1, limit = 10) => {
  const pageSize = Number.parseInt(limit)
  const offset = (Number.parseInt(page) - 1) * pageSize

  try {
    // Đếm tổng số bài viết trước (dùng cho phân trang)
    const totalPosts = await Post.count({
      where: {
        is_archived: false // Chỉ đếm bài viết không bị lưu trữ
      }
    })

    // Lấy bài viết với Eager Loading
    const posts = await Post.findAll({
      where: {
        is_archived: false
        // TODO: Thêm logic lọc theo danh sách người dùng đang follow ở đây
      },
      attributes: {
        include: [
          [
            sequelize.literal(`(
        SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = Post.post_id
      )`),
            "commentCount"
          ],
          [
            sequelize.literal(`(
        SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = Post.post_id
      )`),
            "likeCount"
          ],
          [
            sequelize.literal(`EXISTS (
        SELECT 1 FROM post_likes WHERE post_likes.post_id = Post.post_id AND post_likes.user_id = ${userId}
      )`),
            "isLiked"
          ],
          [
            sequelize.literal(`EXISTS (
        SELECT 1 FROM post_saves WHERE post_saves.post_id = Post.post_id AND post_saves.user_id = ${userId}
      )`),
            "isSaved"
          ]
        ]
      }
      ,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["user_id", "username", "avatar_url", "full_name"] // Thông tin người đăng
        },
        {
          model: PostMedia,
          as: "media",
          attributes: ["media_url", "media_type", "order_index"], // Danh sách media
          required: false // LEFT JOIN
        },
        // Include PostLike và PostComment để COUNT hoạt động. Dùng `required: false` cho LEFT JOIN
        {
          model: PostLike,
          as: "likes",
          attributes: [], // Không cần lấy data, chỉ dùng để COUNT
          required: false
        },
        {
          model: PostComment,
          as: "comments",
          attributes: [], // Không cần lấy data, chỉ dùng để COUNT
          required: false
        }
      ],
      // Grouping theo post_id và các association để COUNT hoạt động đúng
      group: ["Post.post_id", "author.user_id", "media.media_id"],
      order: [["created_at", "DESC"], ["media", "order_index", "ASC"]], // Sắp xếp theo thời gian mới nhất
      limit: pageSize,
      offset: offset,
      subQuery: false // Quan trọng khi dùng LIMIT/OFFSET/GROUP
    })

    // Định dạng lại dữ liệu và chuyển đổi kiểu dữ liệu cho các cột từ literal
    const postsData = posts.map(post => {
      const postJson = post.toJSON()
      // Chuyển đổi các cột COUNT/EXISTS (từ literal/COUNT) về kiểu số/boolean
      postJson.likeCount = Number.parseInt(postJson.likeCount) || 0
      postJson.commentCount = Number.parseInt(postJson.commentCount) || 0
      // Giá trị từ literal thường là '1'/'0' hoặc true/false tùy DB, nên dùng logic linh hoạt
      postJson.isLiked = postJson.isLiked === "1" || postJson.isLiked === 1 || postJson.isLiked === true
      postJson.isSaved = postJson.isSaved === "1" || postJson.isSaved === 1 || postJson.isSaved === true

      return postJson
    })

    return {
      success: true,
      data: {
        posts: postsData,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(totalPosts / pageSize),
          total_count: totalPosts,
          per_page: pageSize
        }
      }
    }
  } catch (error) {
    console.error("Get feed posts error:", error)
    return { success: false, message: "Failed to fetch feed posts", error }
  }
}

const getExploreGridPosts = async (page = 1, limit = 24) => {
  const pageSize = Number.parseInt(limit)
  const offset = (Number.parseInt(page) - 1) * pageSize

  try {
    // 1. Tính TOTAL_COUNT (Tổng số bài viết công khai, KHÔNG cần media)
    const totalPosts = await Post.count({
      where: {
        is_archived: false
      }
    })

    // 2. Tính TOTAL_MEDIA_COUNT (Tổng số bài viết CÔNG KHAI CÓ MEDIA)
    const { count: mediaCountResult } = await Post.findAndCountAll({
      where: {
        is_archived: false
      },
      include: [
        {
          model: PostMedia,
          as: "media",
          attributes: [],
          required: true // INNER JOIN: Chỉ đếm những bài CÓ media
        }
      ],
      // Phải group by Post.post_id để count chính xác khi dùng INNER JOIN
      group: ["Post.post_id"]
    })

    // Khi dùng GROUP BY, Sequelize trả về mảng. Ta phải lấy độ dài của mảng đó.
    const totalMediaCount = Array.isArray(mediaCountResult) ? mediaCountResult.length : mediaCountResult


    // 3. Truy vấn bài viết thực tế (Chỉ lấy những bài CÓ media)
    const posts = await Post.findAll({
      where: {
        is_archived: false
      },
      attributes: [
        "post_id",
        "user_id",
        "created_at"
      ],
      include: [
        {
          model: PostMedia,
          as: "media",
          where: { order_index: 1 },
          attributes: ["media_url", "media_type"],
          required: true // INNER JOIN: Đảm bảo chỉ lấy bài có media
        }
      ],
      order: [["created_at", "DESC"]],
      limit: pageSize,
      offset: offset,
      subQuery: false
    })

    // 4. Định dạng lại dữ liệu trả về (Giữ nguyên)
    const gridPosts = posts.map(post => {
      const postJson = post.toJSON()

      const media = postJson.media && postJson.media.length > 0 ? postJson.media[0] : null

      return {
        post_id: postJson.post_id,
        user_id: postJson.user_id,
        thumbnail_url: media ? media.media_url : null,
        media_type: media ? media.media_type : null,
        is_video: media ? media.media_type === "video" : false
      }
    })

    // 5. Trả về kết quả với cả hai thông số count
    return {
      success: true,
      data: {
        posts: gridPosts,
        pagination: {
          current_page: Number.parseInt(page),
          // Total pages phải dựa trên số lượng bài viết có media (totalMediaCount)
          total_pages: Math.ceil(totalMediaCount / pageSize),
          total_count: totalPosts, // 4 (Tổng số bài viết công khai)
          total_media_count: totalMediaCount, // 1 (Số bài viết có media)
          per_page: pageSize
        }
      }
    }
  } catch (error) {
    console.error("Get explore grid posts error:", error)
    return { success: false, message: "Failed to fetch explore grid posts", error }
  }
}

const getUserGridPosts = async (profileUserId, currentUserId, page = 1, limit = 24) => {
  const pageSize = Number.parseInt(limit)
  const offset = (Number.parseInt(page) - 1) * pageSize

  try {
    // 1. Định nghĩa điều kiện lọc cơ bản
    const whereClause = {
      user_id: profileUserId, // Lọc theo ID người dùng
      is_archived: false // Chỉ lấy bài viết chưa bị lưu trữ
      // TODO: Thêm logic kiểm tra quyền riêng tư (User.is_private) tại đây
    }

    // 2. Count tổng số bài viết CÓ MEDIA (để tính Total Pages)
    const { count: mediaCountResult } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PostMedia,
          as: "media",
          attributes: [],
          required: true // INNER JOIN: Chỉ đếm những bài CÓ media
        }
      ],
      group: ["Post.post_id"]
    })

    const totalMediaCount = Array.isArray(mediaCountResult) ? mediaCountResult.length : mediaCountResult


    // 3. Truy vấn bài viết thực tế
    const posts = await Post.findAll({
      where: whereClause,
      attributes: [
        "post_id",
        "user_id",
        "created_at"
      ],
      include: [
        {
          model: PostMedia,
          as: "media",
          where: { order_index: 1 },
          attributes: ["media_url", "media_type"],
          required: true // INNER JOIN: Đảm bảo chỉ lấy bài có media
        }
      ],
      order: [["created_at", "DESC"]], // Bài mới nhất lên trước
      limit: pageSize,
      offset: offset,
      subQuery: false
    })

    // 4. Định dạng lại dữ liệu trả về (Giữ nguyên cấu trúc gọn nhẹ)
    const gridPosts = posts.map(post => {
      const postJson = post.toJSON()

      const media = postJson.media && postJson.media.length > 0 ? postJson.media[0] : null

      return {
        post_id: postJson.post_id,
        user_id: postJson.user_id,
        thumbnail_url: media ? media.media_url : null,
        media_type: media ? media.media_type : null,
        is_video: media ? media.media_type === "video" : false
      }
    })

    return {
      success: true,
      data: {
        posts: gridPosts,
        pagination: {
          current_page: Number.parseInt(page),
          total_pages: Math.ceil(totalMediaCount / pageSize),
          total_count: totalMediaCount, // Tổng số bài có media để phân trang
          per_page: pageSize
        }
      }
    }
  } catch (error) {
    console.error("Get user grid posts error:", error)
    return { success: false, message: "Failed to fetch user grid posts", error }
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
  getFeedPosts,
  getExploreGridPosts,
  getUserGridPosts
}
