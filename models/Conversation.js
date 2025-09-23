const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")

const Conversation = sequelize.define(
  "Conversation",
  {
    conversation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [1, 100],
      },
    },
    is_group: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "conversations",
    timestamps: false,
  },
)

module.exports = Conversation
