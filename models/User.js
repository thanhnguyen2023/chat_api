const { DataTypes } = require("sequelize")
const sequelize = require("../config/sequelize")
const bcrypt = require("bcryptjs")

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        isAlphanumeric: true,
      },
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other", "unspecified"),
      defaultValue: "unspecified",
      allowNull: false,
    },
    is_private: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [1, 100],
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    avatar_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    status: {
      type: DataTypes.ENUM("online", "offline", "busy"),
      defaultValue: "offline",
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(12)
          user.password = await bcrypt.hash(user.password, salt)
        }
      },
    },
  },
)

// Instance methods
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

User.prototype.toJSON = function () {
  const values = { ...this.get() }
  delete values.password
  return values
}

module.exports = User
