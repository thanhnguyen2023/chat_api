const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")

const BlockedUser = sequelize.define(
  "BlockedUser",
  {
    block_id: {
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
    blocked_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "blocked_users",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "blocked_user_id"],
      },
    ],
    validate: {
      notSelfBlock() {
        if (this.user_id === this.blocked_user_id) {
          throw new Error("Users cannot block themselves")
        }
      },
    },
  },
)

module.exports = BlockedUser
