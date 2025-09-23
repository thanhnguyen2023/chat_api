const jwt = require("jsonwebtoken")
const { User } = require("../models")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: { message: "Access token required" } })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    })

    if (!user) {
      return res.status(401).json({ error: { message: "Invalid token" } })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: { message: "Invalid token" } })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: { message: "Token expired" } })
    }
    return res.status(500).json({ error: { message: "Authentication error" } })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ["password"] },
      })
      req.user = user
    }
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
}
