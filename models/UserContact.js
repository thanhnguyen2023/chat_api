const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")

const UserContact = sequelize.define(
  "UserContact",
  {
    contact_id: {
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
    friend_id: {
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
    tableName: "user_contacts",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "friend_id"],
      },
    ],
    validate: {
      notSelfFriend() {
        if (this.user_id === this.friend_id) {
          throw new Error("Users cannot add themselves as friends")
        }
      },
    },
  },
)

module.exports = UserContact
