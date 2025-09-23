# Real-time Chat API

A complete RESTful API for a real-time chat application built with Express.js, Sequelize ORM, MySQL, and Socket.IO.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and profile management
- **Real-time Messaging**: Socket.IO powered real-time chat with typing indicators and message status
- **Conversations**: Support for both direct messages and group chats
- **File Attachments**: Upload and share images, videos, documents, and audio files
- **User Management**: Contact system, user blocking, and online status tracking
- **Notifications**: Real-time notifications for messages and system events
- **Message Status**: Track message delivery and read status
- **Search**: Search messages across conversations
- **Security**: Rate limiting, CORS protection, and input validation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi

## Database Schema

The application uses 10 main tables:

1. **users** - User accounts and profiles
2. **conversations** - Chat conversations (direct and group)
3. **messages** - Chat messages
4. **participants** - Conversation participants
5. **attachments** - File attachments
6. **message_status** - Message read/delivery status
7. **user_contacts** - User friends/contacts
8. **notifications** - System notifications
9. **blocked_users** - Blocked user relationships
10. **group_settings** - Group chat settings

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=chat_app
   DB_USER=root
   DB_PASSWORD=your_password

   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads

   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Set up the database**
   
   Create the database and tables:
   ```bash
   mysql -u root -p < scripts/create-database.sql
   ```
   
   Or run the SQL script manually in your MySQL client.

5. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/verify` - Verify JWT token

### Users
- `GET /api/users` - Get all users (with search and pagination)
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users/me/contacts` - Get user contacts
- `POST /api/users/me/contacts/:friendId` - Add user to contacts
- `DELETE /api/users/me/contacts/:friendId` - Remove user from contacts
- `POST /api/users/me/blocked/:userId` - Block user
- `DELETE /api/users/me/blocked/:userId` - Unblock user
- `GET /api/users/me/blocked` - Get blocked users

### Conversations
- `GET /api/conversations` - Get user conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:conversationId` - Get conversation by ID
- `PUT /api/conversations/:conversationId` - Update conversation
- `DELETE /api/conversations/:conversationId` - Leave conversation
- `POST /api/conversations/:conversationId/participants` - Add participant
- `DELETE /api/conversations/:conversationId/participants/:userId` - Remove participant

### Messages
- `GET /api/messages/conversation/:conversationId` - Get conversation messages
- `POST /api/messages` - Send message
- `GET /api/messages/:messageId` - Get message by ID
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete message
- `PATCH /api/messages/:messageId/status` - Update message status
- `PATCH /api/messages/conversation/:conversationId/read` - Mark all messages as read
- `GET /api/messages/search` - Search messages

### File Upload
- `POST /api/upload/message/:messageId` - Upload files to message
- `POST /api/upload/avatar` - Upload user avatar
- `GET /api/upload/attachment/:attachmentId` - Get attachment info
- `DELETE /api/upload/attachment/:attachmentId` - Delete attachment
- `GET /api/upload/info/:attachmentId` - Get file info

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/:notificationId/seen` - Mark notification as seen
- `PATCH /api/notifications/mark-all-seen` - Mark all notifications as seen
- `DELETE /api/notifications/:notificationId` - Delete notification
- `GET /api/notifications/unread/count` - Get unread notification count

## Socket.IO Events

### Client to Server Events

- `send_message` - Send a new message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `message_read` - Mark message as read
- `join_conversation` - Join conversation room
- `leave_conversation` - Leave conversation room
- `update_status` - Update user status
- `get_online_users` - Get online users in conversation

### Server to Client Events

- `new_message` - New message received
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `message_status_updated` - Message status updated
- `user_status_changed` - User status changed
- `joined_conversation` - Successfully joined conversation
- `left_conversation` - Successfully left conversation
- `online_users` - List of online users
- `unread_notifications_count` - Unread notification count
- `error` - Error occurred

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Uploads

Supported file types:
- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, MPEG, QuickTime, WebM
- **Documents**: PDF, Word, Excel, Text files
- **Audio**: MP3, WAV, OGG, MP4 Audio

Maximum file size: 10MB (configurable)
Maximum files per upload: 5

## Error Handling

The API returns consistent error responses:

```json
{
  "error": {
    "message": "Error description",
    "details": ["Additional error details"]
  }
}
```

## Rate Limiting

API endpoints are rate limited to 100 requests per 15 minutes per IP address.

## Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation with Joi
- SQL injection prevention with Sequelize
- File upload restrictions

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts the server with nodemon for automatic restarts on file changes.

### Database Migrations

The application uses Sequelize with automatic table creation. For production, consider using proper migrations:

```bash
npm run migrate
```

### Environment Variables

Make sure to set all required environment variables before starting the server. See `.env.example` for the complete list.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Set up proper database backups
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Monitor logs and performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
