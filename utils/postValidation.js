const Joi = require("joi")

// Validation khi tạo post
const createPost = Joi.object({
  caption: Joi.string().max(2200).allow("").optional(),
  location: Joi.string().max(255).allow("").optional()
})

// Validation khi thêm comment
const createComment = Joi.object({
  content: Joi.string().max(2000).required(),
  parent_comment_id: Joi.number().integer().positive().optional()
})

// Validation khi sửa post (chỉ cần ít nhất 1 trường)
const updatePost = Joi.object({
  caption: Joi.string().max(2200).allow("").optional(),
  location: Joi.string().max(255).allow("").optional()
}).min(1)

const updateComment = Joi.object({
  content: Joi.string().max(2000).required()
})

const updatePostMedia = Joi.object({
  media: Joi.array().items(
    Joi.object({
      media_url: Joi.string().uri().max(512).required(),
      media_type: Joi.string().valid("image", "video").required(),
      order_index: Joi.number().integer().min(1).optional()
    })
  ).min(1).required()
})

module.exports = {
  createPost,
  createComment,
  updatePost,
  updateComment,
  updatePostMedia
}