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


// Mình follow người khác
User.belongsToMany(User, {
  through: UserContact,
  as: "Following", // mình đang theo dõi người khác
  foreignKey: "user_id",
  otherKey: "friend_id"
})

// Người khác follow mình
User.belongsToMany(User, {
  through: UserContact,
  as: "Followers", // người khác đang theo dõi mình
  foreignKey: "friend_id",
  otherKey: "user_id"
})  

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

    // Follow associations
  User.belongsToMany(User, {
    as: "Followers",       // những người theo dõi tôi
    through: Follow,
    foreignKey: "following_id",
    otherKey: "follower_id"
  });

  User.belongsToMany(User, {
    as: "Followings",      // tôi đang theo dõi ai
    through: Follow,
    foreignKey: "follower_id",
    otherKey: "following_id"
  });

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
}
