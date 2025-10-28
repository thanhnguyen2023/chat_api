require("dotenv").config()
const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
// const path = require("path")

// Import database and models
const sequelize = require("./config/sequelize")
require("./models") // This will load all models

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const conversationRoutes = require("./routes/conversations")
const messageRoutes = require("./routes/messages")
const uploadRoutes = require("./routes/upload")
const notificationRoutes = require("./routes/notifications")

// Import socket handlers
const socketHandler = require("./socket/socketHandler")

const app = express()
const server = http.createServer(app)

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:8080"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

// Middleware
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use("/api/", limiter)

// Static files for uploads
// app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/conversations", conversationRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  })
})

// 404 handler
app.use("/", (req, res) => {
  res.status(404).json({ error: { message: "Route not found" } })
})

// Socket.IO setup
const io = socketIo(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Initialize socket handlers
socketHandler(io)

// Database connection and server start
const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate()
    console.log("✅ Database connection established successfully.")

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" })
    console.log("✅ Database synchronized successfully.")

    // Start server
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 Socket.IO server ready`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
    })
  } catch (error) {
    console.error("❌ Unable to start server:", error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully")
  await sequelize.close()
  server.close(() => {
    console.log("Process terminated")
  })
})
