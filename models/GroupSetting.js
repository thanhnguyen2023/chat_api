const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")

const GroupSetting = sequelize.define(
  "GroupSetting",
  {
    setting_id: {
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
    setting_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [["admin_only_invite", "mute_notifications", "allow_media", "auto_delete_messages"]],
      },
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "group_settings",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["conversation_id", "setting_name"],
      },
    ],
  },
)

module.exports = GroupSetting
