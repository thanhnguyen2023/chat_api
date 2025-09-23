const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")

const Attachment = sequelize.define(
  "Attachment",
  {
    attachment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "messages",
        key: "message_id",
      },
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [["image", "video", "document", "audio", "other"]],
      },
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 104857600, // 100MB in bytes
      },
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "attachments",
    timestamps: false,
  },
)

module.exports = Attachment
