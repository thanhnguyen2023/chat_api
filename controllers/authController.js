// controllers/authController.js
const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { Op } = require("sequelize")

// Helper tạo token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  })
}

const authController = {
  // --- ĐĂNG KÝ BẰNG SĐT ---
  registerPhone: async (req, res) => {
    try {
      const { phone_number, password, full_name } = req.body

      // 1. Kiểm tra SĐT đã tồn tại chưa
      const existingUser = await User.findOne({ where: { phone_number } })
      if (existingUser) {
        return res.status(409).json({
          error: { message: "Số điện thoại đã được sử dụng" }
        })
      }

      // 2. Tạo user mới (Username tự sinh ngẫu nhiên để tránh lỗi duplicate)
      const tempUsername = `user_${phone_number}`

      const user = await User.create({
        phone_number,
        password,
        full_name,
        username: tempUsername,
        status: "online"
        // Email để null
      })

      const token = generateToken(user.user_id)

      res.status(201).json({
        message: "Đăng ký thành công",
        data: {
          user: user.toJSON(),
          token,
          expires_in: process.env.JWT_EXPIRES_IN || "7d"
        }
      })
    } catch (error) {
      console.error("Register Phone Error:", error)
      res.status(500).json({ error: { message: "Đăng ký thất bại" } })
    }
  },

  // --- ĐĂNG NHẬP BẰNG SĐT ---
  loginPhone: async (req, res) => {
    try {
      const { phone_number, password } = req.body

      // 1. Tìm user theo SĐT
      const user = await User.findOne({ where: { phone_number } })

      if (!user) {
        return res.status(401).json({
          error: { message: "Số điện thoại hoặc mật khẩu không đúng" }
        })
      }

      // 2. Kiểm tra mật khẩu
      const isValidPassword = await user.comparePassword(password)
      if (!isValidPassword) {
        return res.status(401).json({
          error: { message: "Số điện thoại hoặc mật khẩu không đúng" }
        })
      }

      // 3. Cập nhật trạng thái và trả về token
      await user.update({ status: "online" })
      const token = generateToken(user.user_id)

      res.json({
        message: "Đăng nhập thành công",
        data: {
          user: user.toJSON(),
          token,
          expires_in: process.env.JWT_EXPIRES_IN || "7d"
        }
      })
    } catch (error) {
      console.error("Login Phone Error:", error)
      res.status(500).json({ error: { message: "Đăng nhập thất bại" } })
    }
  }
}

module.exports = authController
