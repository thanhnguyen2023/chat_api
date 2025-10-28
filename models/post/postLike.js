const { DataTypes } = require("sequelize")
const sequelize = require("../../config/sequelize")

const PostLike = sequelize.define(
  "PostLike",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id"
      }
    },
    post_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "posts",
        key: "post_id"
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "post_likes",
    timestamps: false
  }
)

module.exports = PostLike
