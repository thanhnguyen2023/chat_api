const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")

const Participant = sequelize.define(
  "Participant",
  {
    participant_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conversations",
        key: "conversation_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "participants",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["conversation_id", "user_id"],
      },
    ],
  },
)

module.exports = Participant
