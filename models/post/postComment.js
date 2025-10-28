const { DataTypes } = require("sequelize")
const sequelize = require("../../config/sequelize")

const PostComment = sequelize.define(
  "PostComment",
  {
    comment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id"
      }
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "posts",
        key: "post_id"
      }
    },
    parent_comment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "post_comments",
        key: "comment_id"
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW
    }
  },
  {
    tableName: "post_comments",
    timestamps: false
  }
)

module.exports = PostComment
