const { DataTypes } = require("sequelize")
const sequelize = require("../../config/sequelize")

const PostSave = sequelize.define(
  "PostSave",
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
    tableName: "post_saves",
    timestamps: false
  }
)

module.exports = PostSave
