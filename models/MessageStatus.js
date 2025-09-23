const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")

const MessageStatus = sequelize.define(
  "MessageStatus",
  {
    status_id: {
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
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    status: {
      type: DataTypes.ENUM("sent", "delivered", "read"),
      allowNull: false,
      defaultValue: "sent",
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "message_status",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["message_id", "receiver_id"],
      },
    ],
  },
)

module.exports = MessageStatus
