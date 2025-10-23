const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")

const Notification = sequelize.define(
  "Notification",
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    type: {
      type: DataTypes.ENUM(
        "new_message",
        "group_invite",
        "friend_request",
        "friend_accept",
        "post_like",
        "post_comment",
        "comment_reply",
        "post_share",
        "follow",
        "mention",
        "system"
      ),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000],
      },
    },
    reference_type: {
      type: DataTypes.ENUM("post", "comment", "message", "user", "conversation"),
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    is_seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
  },
)

module.exports = Notification
