const { DataTypes } = require("sequelize")
const sequelize = require("../../config/sequelize")

const PostMedia = sequelize.define(
  "PostMedia",
  {
    media_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "posts",
        key: "post_id"
      }
    },
    media_url: {
      type: DataTypes.STRING(512),
      allowNull: false
    },
    media_type: {
      type: DataTypes.ENUM("image", "video"),
      allowNull: false
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "post_media",
    timestamps: false
  }
)

module.exports = PostMedia
