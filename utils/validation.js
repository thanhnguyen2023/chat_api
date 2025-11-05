const Joi = require("joi")
const postValidationSchemas = require("./postValidation")

const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().max(100).required(),
    password: Joi.string().min(6).max(128).required(),
    avatar_url: Joi.string().uri().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).optional(),
    avatar_url: Joi.string().uri().optional(),
    status: Joi.string().valid("online", "offline", "busy").optional(),
  }),

  createConversation: Joi.object({
    conversation_name: Joi.string().max(100).optional(),
    is_group: Joi.boolean().required(),
    participant_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
  }),

  sendMessage: Joi.object({
    content: Joi.string().max(5000).required(),
    conversation_id: Joi.number().integer().positive().required(),
  }),

  updateMessageStatus: Joi.object({
    status: Joi.string().valid("sent", "delivered", "read").required(),
  }),

  createPost: postValidationSchemas.createPost,
  createComment: postValidationSchemas.createComment,

  updatePost: postValidationSchemas.updatePost,
  updateComment: postValidationSchemas.updateComment,

  updatePostMedia: postValidationSchemas.updatePostMedia
}

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        error: {
          message: "Validation error",
          details: error.details.map((detail) => detail.message),
        },
      })
    }
    next()
  }
}

module.exports = {
  schemas,
  validate
}
