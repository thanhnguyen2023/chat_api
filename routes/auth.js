const express = require("express")
const jwt = require("jsonwebtoken")
const { User } = require("../models")
const { validate, schemas } = require("../utils/validation")
const { authenticateToken } = require("../middleware/auth")
const { Op } = require("sequelize")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" })
}

// Register new user
router.post("/register", validate(schemas.register), async (req, res) => {
  try {
    const { username, email, password, avatar_url } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    })


    if (existingUser) {
      return res.status(409).json({
        error: {
          message: existingUser.email === email ? "Email already registered" : "Username already taken",
        },
      })
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      avatar_url,
      status: "online",
    })

    // Generate token
    const token = generateToken(user.user_id)

    res.status(201).json({
      message: "User registered successfully",
      data: {
        user: user.toJSON(),
        token,
        expires_in: process.env.JWT_EXPIRES_IN || "7d",
      },
    })
  } catch (error) {
    console.error("Registration error:", error)

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: {
          message: "Validation error",
          details: error.errors.map((err) => err.message),
        },
      })
    }

    res.status(500).json({
      error: { message: "Registration failed" },
    })
  }
})

// Login user
router.post("/login", validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(401).json({
        error: { message: "Invalid email or password" },
      })
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)

    if (!isValidPassword) {
      return res.status(401).json({
        error: { message: "Invalid email or password" },
      })
    }

    // Update user status to online
    await user.update({ status: "online" })

    // Generate token
    const token = generateToken(user.user_id)

    res.json({
      message: "Login successful",
      data: {
        user: user.toJSON(),
        token,
        expires_in: process.env.JWT_EXPIRES_IN || "7d",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      error: { message: "Login failed" },
    })
  }
})

// Logout user
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Update user status to offline
    await req.user.update({ status: "offline" })

    res.json({
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({
      error: { message: "Logout failed" },
    })
  }
})



// Refresh token
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user.user_id)

    res.json({
      message: "Token refreshed successfully",
      data: {
        token,
        expires_in: process.env.JWT_EXPIRES_IN || "7d",
      },
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    res.status(500).json({
      error: { message: "Failed to refresh token" },
    })
  }
})

// Verify token (for client-side validation)
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    message: "Token is valid",
    data: {
      user: req.user.toJSON(),
    },
  })
})

module.exports = router
