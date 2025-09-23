# Chat API Documentation

## Base URL
```
http://localhost:3000/api
```

## Xác thực (Authentication)

API sử dụng JWT (JSON Web Token) để xác thực. Token phải được gửi trong header `Authorization` với format:
```
Authorization: Bearer <token>
```

## Cấu trúc Response

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

## Rate Limiting

- **General endpoints**: 100 requests/15 minutes
- **Auth endpoints**: 5 requests/15 minutes
- **Upload endpoints**: 10 requests/15 minutes

---

# Authentication Endpoints

## POST /api/auth/register
Đăng ký tài khoản mới

### Request Body
```json
{
  "username": "string (required, 3-50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)",
  "fullName": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "isOnline": false,
      "lastSeen": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

## POST /api/auth/login
Đăng nhập

### Request Body
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "isOnline": true,
      "lastSeen": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

## POST /api/auth/logout
Đăng xuất (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## GET /api/auth/me
Lấy thông tin profile người dùng hiện tại (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "avatar": "avatar_url",
    "isOnline": true,
    "lastSeen": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## PUT /api/auth/me
Cập nhật profile người dùng (yêu cầu authentication)

### Request Body
```json
{
  "fullName": "string (optional)",
  "phoneNumber": "string (optional)",
  "avatar": "string (optional)"
}
```

## POST /api/auth/refresh
Làm mới JWT token

### Request Body
```json
{
  "refreshToken": "string (required)"
}
```

## GET /api/auth/verify
Kiểm tra tính hợp lệ của token (yêu cầu authentication)

---

# User Management Endpoints

## GET /api/users
Lấy danh sách người dùng (yêu cầu authentication)

### Query Parameters
- `search`: string - Tìm kiếm theo username hoặc fullName
- `page`: number - Số trang (default: 1)
- `limit`: number - Số lượng per page (default: 20, max: 100)
- `online`: boolean - Lọc theo trạng thái online

### Response
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "avatar_url",
        "isOnline": true,
        "lastSeen": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## GET /api/users/:userId
Lấy thông tin người dùng theo ID (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "fullName": "John Doe",
    "avatar": "avatar_url",
    "isOnline": true,
    "lastSeen": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## GET /api/users/me/contacts
Lấy danh sách bạn bè/liên hệ (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "username": "jane_doe",
      "fullName": "Jane Doe",
      "avatar": "avatar_url",
      "isOnline": false,
      "lastSeen": "2024-01-01T00:00:00.000Z",
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## POST /api/users/me/contacts/:friendId
Thêm bạn bè (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "message": "Contact added successfully"
}
```

## DELETE /api/users/me/contacts/:friendId
Xóa bạn bè (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "message": "Contact removed successfully"
}
```

## POST /api/users/me/blocked/:userId
Chặn người dùng (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "message": "User blocked successfully"
}
```

## DELETE /api/users/me/blocked/:userId
Bỏ chặn người dùng (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "message": "User unblocked successfully"
}
```

## GET /api/users/me/blocked
Lấy danh sách người dùng bị chặn (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "username": "blocked_user",
      "fullName": "Blocked User",
      "avatar": "avatar_url",
      "blockedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

# Conversation Management Endpoints

## GET /api/conversations
Lấy danh sách cuộc trò chuyện (yêu cầu authentication)

### Query Parameters
- `page`: number - Số trang (default: 1)
- `limit`: number - Số lượng per page (default: 20)

### Response
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 1,
        "name": "Group Chat",
        "type": "group",
        "avatar": "group_avatar_url",
        "lastMessage": {
          "id": 100,
          "content": "Hello everyone!",
          "senderId": 2,
          "senderName": "Jane Doe",
          "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "unreadCount": 3,
        "participants": [
          {
            "id": 1,
            "username": "john_doe",
            "fullName": "John Doe",
            "avatar": "avatar_url"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalConversations": 50
    }
  }
}
```

## POST /api/conversations
Tạo cuộc trò chuyện mới (yêu cầu authentication)

### Request Body
```json
{
  "type": "private|group",
  "name": "string (required for group)",
  "participantIds": [2, 3, 4],
  "avatar": "string (optional)"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "New Group",
    "type": "group",
    "avatar": "avatar_url",
    "createdBy": 1,
    "participants": [
      {
        "id": 1,
        "username": "john_doe",
        "fullName": "John Doe",
        "role": "admin"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Conversation created successfully"
}
```

## GET /api/conversations/:conversationId
Lấy thông tin cuộc trò chuyện (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Group Chat",
    "type": "group",
    "avatar": "avatar_url",
    "createdBy": 1,
    "participants": [
      {
        "id": 1,
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "avatar_url",
        "role": "admin",
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "settings": {
      "allowMemberInvite": true,
      "allowMemberLeave": true,
      "muteNotifications": false
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## PUT /api/conversations/:conversationId
Cập nhật cuộc trò chuyện (yêu cầu authentication và quyền admin)

### Request Body
```json
{
  "name": "string (optional)",
  "avatar": "string (optional)",
  "settings": {
    "allowMemberInvite": "boolean (optional)",
    "allowMemberLeave": "boolean (optional)"
  }
}
```

## POST /api/conversations/:conversationId/participants
Thêm thành viên vào nhóm (yêu cầu authentication)

### Request Body
```json
{
  "userIds": [4, 5, 6]
}
```

### Response
```json
{
  "success": true,
  "data": {
    "addedParticipants": [
      {
        "id": 4,
        "username": "new_user",
        "fullName": "New User",
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Participants added successfully"
}
```

## DELETE /api/conversations/:conversationId/participants/:userId
Xóa thành viên khỏi nhóm (yêu cầu authentication và quyền admin)

### Response
```json
{
  "success": true,
  "message": "Participant removed successfully"
}
```

## DELETE /api/conversations/:conversationId
Xóa/rời khỏi cuộc trò chuyện (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "message": "Left conversation successfully"
}
```

---

# Message Endpoints

## GET /api/messages/conversation/:conversationId
Lấy tin nhắn trong cuộc trò chuyện (yêu cầu authentication)

### Query Parameters
- `page`: number - Số trang (default: 1)
- `limit`: number - Số lượng per page (default: 50, max: 100)
- `before`: string - Lấy tin nhắn trước thời điểm này (ISO date)

### Response
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "content": "Hello everyone!",
        "type": "text",
        "senderId": 2,
        "sender": {
          "id": 2,
          "username": "jane_doe",
          "fullName": "Jane Doe",
          "avatar": "avatar_url"
        },
        "conversationId": 1,
        "attachments": [
          {
            "id": 1,
            "fileName": "image.jpg",
            "fileType": "image/jpeg",
            "fileSize": 1024000,
            "url": "/uploads/attachments/image.jpg"
          }
        ],
        "status": "read",
        "editedAt": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalMessages": 500,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## POST /api/messages
Gửi tin nhắn (yêu cầu authentication)

### Request Body
```json
{
  "conversationId": 1,
  "content": "string (required)",
  "type": "text|image|file|audio|video",
  "replyToId": "number (optional)"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Hello everyone!",
    "type": "text",
    "senderId": 1,
    "conversationId": 1,
    "replyToId": null,
    "status": "sent",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Message sent successfully"
}
```

## GET /api/messages/:messageId
Lấy tin nhắn theo ID (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Hello everyone!",
    "type": "text",
    "senderId": 1,
    "sender": {
      "id": 1,
      "username": "john_doe",
      "fullName": "John Doe",
      "avatar": "avatar_url"
    },
    "conversationId": 1,
    "attachments": [],
    "replyTo": null,
    "status": "read",
    "editedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## PUT /api/messages/:messageId
Chỉnh sửa tin nhắn (yêu cầu authentication và là người gửi)

### Request Body
```json
{
  "content": "string (required)"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Updated message content",
    "editedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Message updated successfully"
}
```

## DELETE /api/messages/:messageId
Xóa tin nhắn (yêu cầu authentication và là người gửi)

### Response
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

## PATCH /api/messages/:messageId/status
Cập nhật trạng thái tin nhắn (yêu cầu authentication)

### Request Body
```json
{
  "status": "delivered|read"
}
```

### Response
```json
{
  "success": true,
  "message": "Message status updated"
}
```

## PATCH /api/messages/conversation/:conversationId/read
Đánh dấu tất cả tin nhắn đã đọc (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  },
  "message": "Messages marked as read"
}
```

## GET /api/messages/search
Tìm kiếm tin nhắn (yêu cầu authentication)

### Query Parameters
- `q`: string - Từ khóa tìm kiếm (required)
- `conversationId`: number - Tìm trong cuộc trò chuyện cụ thể (optional)
- `page`: number - Số trang (default: 1)
- `limit`: number - Số lượng per page (default: 20)

### Response
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "content": "Hello everyone!",
        "senderId": 1,
        "sender": {
          "username": "john_doe",
          "fullName": "John Doe"
        },
        "conversationId": 1,
        "conversation": {
          "name": "Group Chat"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResults": 50
    }
  }
}
```

---

# File Upload Endpoints

## POST /api/upload/message/:messageId
Upload file và đính kèm vào tin nhắn (yêu cầu authentication)

### Request
- Content-Type: multipart/form-data
- Field name: `files` (có thể upload nhiều file)
- Max file size: 10MB per file
- Supported formats: images, documents, audio, video

### Response
```json
{
  "success": true,
  "data": {
    "attachments": [
      {
        "id": 1,
        "fileName": "document.pdf",
        "originalName": "My Document.pdf",
        "fileType": "application/pdf",
        "fileSize": 2048000,
        "url": "/uploads/attachments/document.pdf",
        "messageId": 1,
        "uploadedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Files uploaded successfully"
}
```

## POST /api/upload/avatar
Upload avatar người dùng (yêu cầu authentication)

### Request
- Content-Type: multipart/form-data
- Field name: `avatar`
- Max file size: 5MB
- Supported formats: jpg, jpeg, png, gif

### Response
```json
{
  "success": true,
  "data": {
    "avatarUrl": "/uploads/avatars/user_1_avatar.jpg"
  },
  "message": "Avatar uploaded successfully"
}
```

## GET /api/upload/attachment/:attachmentId
Lấy thông tin file đính kèm (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fileName": "document.pdf",
    "originalName": "My Document.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048000,
    "url": "/uploads/attachments/document.pdf",
    "messageId": 1,
    "uploadedBy": 1,
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## DELETE /api/upload/attachment/:attachmentId
Xóa file đính kèm (yêu cầu authentication và là người upload)

### Response
```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

## GET /api/upload/info/:attachmentId
Lấy thông tin file để download (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "fileName": "document.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048000,
    "downloadUrl": "/uploads/attachments/document.pdf"
  }
}
```

---

# Notification Endpoints

## GET /api/notifications
Lấy danh sách thông báo (yêu cầu authentication)

### Query Parameters
- `page`: number - Số trang (default: 1)
- `limit`: number - Số lượng per page (default: 20)
- `unread`: boolean - Chỉ lấy thông báo chưa đọc

### Response
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "message",
        "title": "New message",
        "content": "You have a new message from John Doe",
        "data": {
          "messageId": 100,
          "conversationId": 1,
          "senderId": 2
        },
        "isSeen": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalNotifications": 100
    }
  }
}
```

## POST /api/notifications
Tạo thông báo (internal use - yêu cầu authentication)

### Request Body
```json
{
  "userId": 1,
  "type": "message|friend_request|group_invite",
  "title": "string (required)",
  "content": "string (required)",
  "data": {}
}
```

## PATCH /api/notifications/:notificationId/seen
Đánh dấu thông báo đã xem (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "message": "Notification marked as seen"
}
```

## PATCH /api/notifications/mark-all-seen
Đánh dấu tất cả thông báo đã xem (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "updatedCount": 10
  },
  "message": "All notifications marked as seen"
}
```

## DELETE /api/notifications/:notificationId
Xóa thông báo (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

## GET /api/notifications/unread/count
Lấy số lượng thông báo chưa đọc (yêu cầu authentication)

### Response
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

# Socket.IO Events

## Connection
```javascript
// Client kết nối
socket.emit('authenticate', { token: 'jwt_token' });

// Server xác nhận
socket.on('authenticated', (data) => {
  console.log('Connected as:', data.user);
});
```

## Message Events
```javascript
// Gửi tin nhắn
socket.emit('send_message', {
  conversationId: 1,
  content: 'Hello!',
  type: 'text'
});

// Nhận tin nhắn mới
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Tin nhắn đã được gửi
socket.on('message_sent', (message) => {
  console.log('Message sent:', message);
});
```

## Typing Events
```javascript
// Bắt đầu typing
socket.emit('typing_start', { conversationId: 1 });

// Dừng typing
socket.emit('typing_stop', { conversationId: 1 });

// Nhận typing status
socket.on('user_typing', (data) => {
  console.log(`${data.user.fullName} is typing...`);
});
```

## Online Status Events
```javascript
// User online
socket.on('user_online', (data) => {
  console.log(`${data.user.fullName} is online`);
});

// User offline
socket.on('user_offline', (data) => {
  console.log(`${data.user.fullName} is offline`);
});
```

## Conversation Events
```javascript
// Join conversation room
socket.emit('join_conversation', { conversationId: 1 });

// Leave conversation room
socket.emit('leave_conversation', { conversationId: 1 });

// Conversation updated
socket.on('conversation_updated', (conversation) => {
  console.log('Conversation updated:', conversation);
});
```

---

# Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Dữ liệu request không hợp lệ |
| 401 | Unauthorized | Chưa xác thực hoặc token không hợp lệ |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Tài nguyên không tồn tại |
| 409 | Conflict | Dữ liệu bị trung lặp |
| 413 | Payload Too Large | File upload quá lớn |
| 422 | Unprocessable Entity | Dữ liệu không thể xử lý |
| 429 | Too Many Requests | Vượt quá rate limit |
| 500 | Internal Server Error | Lỗi server |

---

# Database Schema

## Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone_number VARCHAR(20),
  avatar TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Conversations Table
```sql
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  type ENUM('private', 'group') NOT NULL,
  avatar TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## Messages Table
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  type ENUM('text', 'image', 'file', 'audio', 'video') DEFAULT 'text',
  reply_to_id INT,
  status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
  edited_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (reply_to_id) REFERENCES messages(id)
);
```

## Participants Table
```sql
CREATE TABLE participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin', 'member') DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_participant (conversation_id, user_id)
);
```

---

# Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chat_app
DB_USER=root
DB_PASSWORD=password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

# Installation & Setup

1. **Clone repository và install dependencies**
```bash
npm install
```

2. **Tạo database MySQL**
```bash
mysql -u root -p
CREATE DATABASE chat_app;
```

3. **Chạy migration**
```bash
npm run migrate
```

4. **Seed sample data (optional)**
```bash
npm run seed
```

5. **Start server**
```bash
# Development
npm run dev

# Production
npm start
```

Server sẽ chạy tại `http://localhost:3000`

---

# Testing

Sử dụng Postman hoặc curl để test API:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get conversations (với token)
curl -X GET http://localhost:3000/api/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
