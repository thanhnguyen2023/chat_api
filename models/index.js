const sequelize = require("../config/sequelize")

// Import all models
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
const Follow = require("./Follow")

const Post = require("./post/post")
const PostComment = require("./post/postComment")
const PostLike = require("./post/postLike")
const PostMedia = require("./post/postMedia")
const PostSave = require("./post/postSave")

// Define associations
const defineAssociations = () => {
  // User associations
  User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" })
  User.hasMany(Participant, { foreignKey: "user_id", as: "participations" })
  User.hasMany(MessageStatus, { foreignKey: "receiver_id", as: "messageStatuses" })
  User.hasMany(UserContact, { foreignKey: "user_id", as: "contacts" })
  User.hasMany(UserContact, { foreignKey: "friend_id", as: "friendOf" })
  User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" })
  User.hasMany(BlockedUser, { foreignKey: "user_id", as: "blockedUsers" })
  User.hasMany(BlockedUser, { foreignKey: "blocked_user_id", as: "blockedBy" })
  User.hasMany(Post, { foreignKey: "user_id", as: "posts" })
  User.hasMany(PostComment, { foreignKey: "user_id", as: "userComments" })
  User.hasMany(PostLike, { foreignKey: "user_id" })
  User.hasMany(PostSave, { foreignKey: "user_id" })

  Post.belongsTo(User, { foreignKey: "user_id", as: "author" })
  Post.hasMany(PostMedia, { foreignKey: "post_id", as: "media" })
  PostMedia.belongsTo(Post, { foreignKey: "post_id", as: "post" })
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

  PostLike.belongsTo(User, { foreignKey: "user_id" })
  Post.hasMany(PostLike, { foreignKey: "post_id" })
  PostLike.belongsTo(Post, { foreignKey: "post_id" })

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

  PostSave.belongsTo(User, { foreignKey: "user_id" })
  Post.hasMany(PostSave, { foreignKey: "post_id" })
  PostSave.belongsTo(Post, { foreignKey: "post_id" })

  // Follow associations
  User.belongsToMany(User, {
    as: "Followers", // những người theo dõi tôi
    through: Follow,
    foreignKey: "following_id",
    otherKey: "follower_id"
  })

  User.belongsToMany(User, {
    as: "Followings", // tôi đang theo dõi ai
    through: Follow,
    foreignKey: "follower_id",
    otherKey: "following_id"
  })

  // Conversation associations
  Conversation.hasMany(Message, { foreignKey: "conversation_id", as: "messages" })
  Conversation.hasMany(Participant, { foreignKey: "conversation_id", as: "participants" })
  Conversation.hasMany(GroupSetting, { foreignKey: "conversation_id", as: "settings" })

  // Message associations
  Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" })
  Message.belongsTo(Conversation, { foreignKey: "conversation_id", as: "conversation" })
  Message.hasMany(Attachment, { foreignKey: "message_id", as: "attachments" })
  Message.hasMany(MessageStatus, { foreignKey: "message_id", as: "statuses" })

  // Participant associations
  Participant.belongsTo(User, { foreignKey: "user_id", as: "user" })
  Participant.belongsTo(Conversation, { foreignKey: "conversation_id", as: "conversation" })

  // Attachment associations
  Attachment.belongsTo(Message, { foreignKey: "message_id", as: "message" })

  // MessageStatus associations
  MessageStatus.belongsTo(Message, { foreignKey: "message_id", as: "message" })
  MessageStatus.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" })

  // UserContact associations
  UserContact.belongsTo(User, { foreignKey: "user_id", as: "user" })
  UserContact.belongsTo(User, { foreignKey: "friend_id", as: "friend" })

  // Notification associations
  Notification.belongsTo(User, { foreignKey: "user_id", as: "user" })

  // BlockedUser associations
  BlockedUser.belongsTo(User, { foreignKey: "user_id", as: "user" })
  BlockedUser.belongsTo(User, { foreignKey: "blocked_user_id", as: "blockedUser" })

  // GroupSetting associations
  GroupSetting.belongsTo(Conversation, { foreignKey: "conversation_id", as: "conversation" })
}

// Initialize associations
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
  Follow,
  Post,
  PostMedia,
  PostLike,
  PostComment,
  PostSave
}
