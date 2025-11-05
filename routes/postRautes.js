const express = require("express")
const router = express.Router()
const postController = require("../controllers/postController")
const { validate, schemas } = require("../utils/validation")
const { authenticateToken } = require("../middleware/auth.js")

// Tất cả các route này đều yêu cầu xác thực
router.use(authenticateToken)

// POST /api/posts - Tạo bài viết mới (chỉ caption/location)
router.post(
  "/",
  validate(schemas.createPost),
  postController.createPost
)

// Sửa bài viết
router.put(
  "/:postId",
  validate(schemas.updatePost),
  postController.updatePost
)

// Sửa media
router.put(
  "/:postId/media",
  validate(schemas.updatePostMedia),
  postController.updatePostMedia
)

// GET /api/posts/:postId - Lấy chi tiết bài viết
router.get("/:postId", postController.getPostDetails)

router.get("/:postId/share", postController.getShareableLink)

// POST /api/posts/:postId/like - Thích/Bỏ thích bài viết
router.post("/:postId/like", postController.toggleLikePost)

// POST /api/posts/:postId/save - Lưu/Bỏ lưu bài viết
router.post("/:postId/save", postController.toggleSavePost)

// POST /api/posts/:postId/comment - Thêm bình luận
router.post(
  "/:postId/comment",
  validate(schemas.createComment),
  postController.addComment
)

// Sửa bình luận
router.put(
  "/:postId/comment/:commentId",
  validate(schemas.updateComment),
  postController.updateComment
)

// Xóa bài viết
router.delete("/:postId", postController.deletePost)

// Xóa bình luận
router.delete(
  "/:postId/comment/:commentId",
  postController.deleteComment
)

module.exports = router

