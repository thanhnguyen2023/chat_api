const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { PythonShell } = require("python-shell")
const { Message, Attachment, Conversation, Participant } = require("../models")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories by date for better organization
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    const dateDir = path.join(uploadDir, `${year}/${month}/${day}`)

    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true })
    }

    cb(null, dateDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  },
})

// File filter
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedTypes = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    video: ["video/mp4", "video/mpeg", "video/quicktime", "video/webm"],
    document: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ],
    audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"],
  }

  const allAllowedTypes = Object.values(allowedTypes).flat()

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false)
  }
}

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5, // Maximum 5 files per request
  },
})

// Helper function to determine file type
const getFileType = (mimetype) => {
  if (mimetype.startsWith("image/")) return "image"
  if (mimetype.startsWith("video/")) return "video"
  if (mimetype.startsWith("audio/")) return "audio"
  return "document"
}

// === Function to check NSFW ===
const checkNSFW = (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonPath = "python" // Nếu dùng virtualenv thì chỉnh lại thành đường dẫn cụ thể
    const scriptPath = path.join(__dirname, "../open_nsfw/classify_nsfw.py")

    const modelDef = path.join(__dirname, "../open_nsfw/nsfw_model/deploy.prototxt")
    const pretrainedModel = path.join(__dirname, "../open_nsfw/nsfw_model/resnet_50_1by2_nsfw.caffemodel")

    const options = {
      mode: "text",
      pythonPath,
      pythonOptions: ["-u"],
      args: [
        "--model_def", modelDef,
        "--pretrained_model", pretrainedModel,
        filePath, // input_file phải nằm cuối
      ],
    }

    PythonShell.run(scriptPath, options)
      .then((results) => {
        if (!results || results.length === 0) {
          return resolve(0)
        }
        const lastLine = results[results.length - 1].trim()
        const score = parseFloat(lastLine)
        resolve(isNaN(score) ? 0 : score)
      })
      .catch((err) => {
        console.error("PythonShellError:", err)
        reject(err)
      })
  })
}


// Upload files and attach to message
router.post("/message/:messageId", authenticateToken, upload.array("files", 5), async (req, res) => {
  try {
    const { messageId } = req.params
    const files = req.files

    if (!files || files.length === 0)
      return res.status(400).json({ error: { message: "No files uploaded" } })

    // Kiểm tra message có tồn tại không
    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: Conversation,
          as: "conversation",
          include: [
            {
              model: Participant,
              as: "participants",
              where: { user_id: req.user.user_id },
              attributes: [],
            },
          ],
        },
      ],
    })

    if (!message) {
      files.forEach((f) => fs.unlink(f.path, () => {}))
      return res.status(404).json({ error: { message: "Message not found or access denied" } })
    }

    if (message.sender_id !== req.user.user_id) {
      files.forEach((f) => fs.unlink(f.path, () => {}))
      return res.status(403).json({ error: { message: "Can only add attachments to your own messages" } })
    }

    // === 🧠 Check NSFW cho từng ảnh ===
    for (const file of files) {
      if (file.mimetype.startsWith("image/")) {
        const nsfwScore = await checkNSFW(file.path)
        console.log(`🧩 [${file.originalname}] NSFW Score =`, nsfwScore)
        if (nsfwScore > 0.6) {
          fs.unlink(file.path, () => {})
          return res.status(400).json({
              error: { message: "Ảnh có nội dung không phù hợp" },
          })
        }
      }
    }

    // === Lưu vào DB ===
    const attachments = await Promise.all(
      files.map((file) => {
        const relativePath = path.relative(path.join(__dirname, ".."), file.path)
        const fileUrl = `/${relativePath.replace(/\\/g, "/")}`
        return Attachment.create({
          message_id: messageId,
          file_url: fileUrl,
          file_type: getFileType(file.mimetype),
          file_size: file.size,
        })
      })
    )

    res.status(201).json({
      message: "✅ Files uploaded successfully",
      data: attachments.map((a) => ({
        attachment_id: a.attachment_id,
        file_url: a.file_url,
        file_type: a.file_type,
        file_size: a.file_size,
        uploaded_at: a.uploaded_at,
      })),
    })
  } catch (error) {
    console.error("Upload error:", error)
    if (req.files) req.files.forEach((f) => fs.unlink(f.path, () => {}))
    res.status(500).json({ error: { message: "Upload failed" } })
  }
})

// Upload avatar
router.post("/avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({
        error: { message: "No file uploaded" },
      })
    }

    // Check if it's an image
    if (!file.mimetype.startsWith("image/")) {
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting file:", err)
      })

      return res.status(400).json({
        error: { message: "Avatar must be an image" },
      })
    }

    // Generate file URL
    const relativePath = path.relative(path.join(__dirname, ".."), file.path)
    const fileUrl = `/${relativePath.replace(/\\/g, "/")}`
    const fullUrl = `${req.protocol}://${req.get("host")}${fileUrl}`

    // Update user avatar
    await req.user.update({ avatar_url: fullUrl })

    res.json({
      message: "Avatar uploaded successfully",
      data: {
        avatar_url: fullUrl,
      },
    })
  } catch (error) {
    console.error("Avatar upload error:", error)

    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err)
      })
    }

    res.status(500).json({
      error: { message: "Avatar upload failed" },
    })
  }
})

// Get attachment by ID
router.get("/attachment/:attachmentId", authenticateToken, async (req, res) => {
  try {
    const { attachmentId } = req.params

    const attachment = await Attachment.findByPk(attachmentId, {
      include: [
        {
          model: Message,
          as: "message",
          include: [
            {
              model: Conversation,
              as: "conversation",
              include: [
                {
                  model: Participant,
                  as: "participants",
                  where: { user_id: req.user.user_id },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!attachment) {
      return res.status(404).json({
        error: { message: "Attachment not found or access denied" },
      })
    }

    res.json({
      data: { attachment },
    })
  } catch (error) {
    console.error("Get attachment error:", error)
    res.status(500).json({
      error: { message: "Failed to get attachment" },
    })
  }
})

// Delete attachment
router.delete("/attachment/:attachmentId", authenticateToken, async (req, res) => {
  try {
    const { attachmentId } = req.params

    const attachment = await Attachment.findByPk(attachmentId, {
      include: [
        {
          model: Message,
          as: "message",
          include: [
            {
              model: Conversation,
              as: "conversation",
              include: [
                {
                  model: Participant,
                  as: "participants",
                  where: { user_id: req.user.user_id },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!attachment) {
      return res.status(404).json({
        error: { message: "Attachment not found or access denied" },
      })
    }

    // Only message sender can delete attachments
    if (attachment.message.sender_id !== req.user.user_id) {
      return res.status(403).json({
        error: { message: "Can only delete attachments from your own messages" },
      })
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", attachment.file_url)
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err)
    })

    // Delete attachment record
    await attachment.destroy()

    res.json({
      message: "Attachment deleted successfully",
    })
  } catch (error) {
    console.error("Delete attachment error:", error)
    res.status(500).json({
      error: { message: "Failed to delete attachment" },
    })
  }
})

// Get file info (for download)
router.get("/info/:attachmentId", authenticateToken, async (req, res) => {
  try {
    const { attachmentId } = req.params

    const attachment = await Attachment.findByPk(attachmentId, {
      include: [
        {
          model: Message,
          as: "message",
          include: [
            {
              model: Conversation,
              as: "conversation",
              include: [
                {
                  model: Participant,
                  as: "participants",
                  where: { user_id: req.user.user_id },
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!attachment) {
      return res.status(404).json({
        error: { message: "Attachment not found or access denied" },
      })
    }

    // Get file stats
    const filePath = path.join(__dirname, "..", attachment.file_url)

    try {
      const stats = fs.statSync(filePath)

      res.json({
        data: {
          attachment_id: attachment.attachment_id,
          file_url: attachment.file_url,
          file_type: attachment.file_type,
          file_size: attachment.file_size,
          uploaded_at: attachment.uploaded_at,
          exists: true,
          actual_size: stats.size,
        },
      })
    } catch (fileError) {
      res.json({
        data: {
          attachment_id: attachment.attachment_id,
          file_url: attachment.file_url,
          file_type: attachment.file_type,
          file_size: attachment.file_size,
          uploaded_at: attachment.uploaded_at,
          exists: false,
        },
      })
    }
  } catch (error) {
    console.error("Get file info error:", error)
    res.status(500).json({
      error: { message: "Failed to get file info" },
    })
  }
})

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: { message: "File too large" },
      })
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: { message: "Too many files" },
      })
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: { message: "Unexpected file field" },
      })
    }
  }

  if (error.message.includes("File type") && error.message.includes("not allowed")) {
    return res.status(400).json({
      error: { message: error.message },
    })
  }

  next(error)
})

module.exports = router
