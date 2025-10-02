// models/Follow.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // import instance sequelize

const Follow = sequelize.define('Follow', {
  follow_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',      // tên bảng users
      key: 'user_id',       // cột khóa chính
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  following_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'follows',
  timestamps: false,
  indexes: [
    {
      unique: true,                 // duy nhất theo cặp follower_id + following_id
      fields: ['follower_id', 'following_id'],
    },
  ],
});

// Optional: thêm validate để tránh tự follow mình
Follow.beforeCreate(async (follow, options) => {
  if (follow.follower_id === follow.following_id) {
    throw new Error("Cannot follow yourself");
  }
});

module.exports = Follow;
