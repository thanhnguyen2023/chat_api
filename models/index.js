const sequelize = require("../config/sequelize")

// Import models
const User = require("./User")
const Conversation = require("./Conversation")
const Message = require("./Message")
const Participant = require("./Participant")
const Attachment = require("./Attachment")
const MessageStatus = require("./MessageStatus")
const UserContact = require("./UserContact")
const Notification = require("./Notification")
const BlockedUser = require("./BlockedUser")
const GroupSetting = require("./GroupSetting")

// Post models
const Post = require("./post/post")
const PostComment = require("./post/postComment")
const PostLike = require("./post/postLike")
const PostMedia = require("./post/postMedia")
const PostSave = require("./post/postSave")

const defineAssociations = () => {
  User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" })
  User.hasMany(Participant, { foreignKey: "user_id", as: "participations" })
  User.hasMany(MessageStatus, { foreignKey: "receiver_id", as: "messageStatuses" })
  User.hasMany(UserContact, { foreignKey: "user_id", as: "contacts" })
  User.hasMany(UserContact, { foreignKey: "friend_id", as: "friendOf" })
  User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" })
  User.hasMany(BlockedUser, { foreignKey: "user_id", as: "blockedUsers" })
  User.hasMany(BlockedUser, { foreignKey: "blocked_user_id", as: "blockedBy" })

  // Follow
  User.belongsToMany(User, {
    through: UserContact,
    as: "Following",
    foreignKey: "user_id",
    otherKey: "friend_id"
  })

  User.belongsToMany(User, {
    through: UserContact,
    as: "Followers",
    foreignKey: "friend_id",
    otherKey: "user_id"
  })

  // Post
  User.hasMany(Post, { foreignKey: "user_id", as: "posts" })
  User.hasMany(PostComment, { foreignKey: "user_id", as: "userComments" })
  User.hasMany(PostLike, { foreignKey: "user_id" })
  User.hasMany(PostSave, { foreignKey: "user_id" })

  Post.belongsTo(User, { foreignKey: "user_id", as: "author" })
  Post.hasMany(PostMedia, { foreignKey: "post_id", as: "media" })
  PostMedia.belongsTo(Post, { foreignKey: "post_id", as: "post" })

  Post.hasMany(PostLike, { foreignKey: "post_id", as: "likes" })
  PostLike.belongsTo(User, {
    foreignKey: "user_id",
    as: "user", 
  })

  Post.hasMany(PostSave, { foreignKey: "post_id", as: "saves" })
  PostSave.belongsTo(User, {
    foreignKey: "user_id",
    as: "user", 
  })

  Post.hasMany(PostComment, { foreignKey: "post_id", as: "comments" })
  PostComment.belongsTo(Post, { foreignKey: "post_id" })
  PostComment.belongsTo(User, { foreignKey: "user_id", as: "commenter" })

  PostComment.hasMany(PostComment, {
    foreignKey: "parent_comment_id",
    as: "replies"
  })
  PostComment.belongsTo(PostComment, {
    foreignKey: "parent_comment_id",
    as: "parentComment"
  })

  User.belongsToMany(Post, {
    through: PostLike,
    foreignKey: "user_id",
    otherKey: "post_id",
    as: "likedPosts"
  })
  Post.belongsToMany(User, {
    through: PostLike,
    foreignKey: "post_id",
    otherKey: "user_id",
    as: "likedByUsers"
  })

  User.belongsToMany(Post, {
    through: PostSave,
    foreignKey: "user_id",
    otherKey: "post_id",
    as: "savedPosts"
  })
  Post.belongsToMany(User, {
    through: PostSave,
    foreignKey: "post_id",
    otherKey: "user_id",
    as: "savedByUsers"
  })

  // Chat
  Conversation.hasMany(Message, { foreignKey: "conversation_id", as: "messages" })
  Conversation.hasMany(Participant, { foreignKey: "conversation_id", as: "participants" })
  Conversation.hasMany(GroupSetting, { foreignKey: "conversation_id", as: "settings" })

  Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" })
  Message.belongsTo(Conversation, { foreignKey: "conversation_id", as: "conversation" })
  Message.hasMany(Attachment, { foreignKey: "message_id", as: "attachments" })
  Message.hasMany(MessageStatus, { foreignKey: "message_id", as: "statuses" })

  Participant.belongsTo(User, { foreignKey: "user_id", as: "user" })
  Participant.belongsTo(Conversation, { foreignKey: "conversation_id", as: "conversation" })

  Attachment.belongsTo(Message, { foreignKey: "message_id", as: "message" })

  MessageStatus.belongsTo(Message, { foreignKey: "message_id", as: "message" })
  MessageStatus.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" })

  Notification.belongsTo(User, { foreignKey: "user_id", as: "user" })
  BlockedUser.belongsTo(User, { foreignKey: "user_id", as: "user" })
  BlockedUser.belongsTo(User, { foreignKey: "blocked_user_id", as: "blockedUser" })

  GroupSetting.belongsTo(Conversation, { foreignKey: "conversation_id", as: "conversation" })
}

defineAssociations()

module.exports = {
  sequelize,
  User,
  Conversation,
  Message,
  Participant,
  Attachment,
  MessageStatus,
  UserContact,
  Notification,
  BlockedUser,
  GroupSetting,
  Post,
  PostMedia,
  PostLike,
  PostComment,
  PostSave
}
