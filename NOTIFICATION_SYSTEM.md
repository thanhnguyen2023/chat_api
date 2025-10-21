# Notification System Documentation

## Overview

The notification system has been enhanced to support both chat application and social media features. It includes real-time notifications via Socket.IO and comprehensive REST API endpoints.

## Notification Types

### Chat Application Notifications
- `new_message` - New message received in a conversation
- `group_invite` - Invitation to join a group chat
- `friend_request` - Friend request from another user
- `friend_accept` - Friend request has been accepted

### Social Media Notifications
- `post_like` - Someone liked your post
- `post_comment` - Someone commented on your post
- `comment_reply` - Someone replied to your comment
- `post_share` - Someone shared your post
- `follow` - Someone started following you
- `mention` - Someone mentioned you in a post or comment

### System Notifications
- `system` - System-wide announcements or updates

## Database Schema

### Notification Model Fields

```javascript
{
  notification_id: INTEGER (Primary Key),
  user_id: INTEGER (Required) - User who receives the notification,
  actor_id: INTEGER (Optional) - User who triggered the notification,
  type: ENUM (Required) - One of the notification types listed above,
  content: TEXT (Required) - Human-readable notification message,
  reference_type: ENUM (Optional) - Type of referenced entity: 'post', 'comment', 'message', 'user', 'conversation',
  reference_id: INTEGER (Optional) - ID of the referenced entity,
  created_at: TIMESTAMP (Default: now()),
  is_seen: BOOLEAN (Default: false)
}
```

### Example Notification Records

```javascript
// Post like notification
{
  user_id: 123,
  actor_id: 456,
  type: "post_like",
  content: "John liked your post",
  reference_type: "post",
  reference_id: 789
}

// New message notification
{
  user_id: 123,
  actor_id: 456,
  type: "new_message",
  content: "New message from Sarah",
  reference_type: "message",
  reference_id: 321
}
```

## REST API Endpoints

### Get Notifications
**GET** `/api/notifications`

Query parameters:
- `page` (optional, default: 1)
- `limit` (optional, default: 20)
- `is_seen` (optional, filter by seen status: "true" or "false")

Response includes actor information for each notification.

### Create Notification
**POST** `/api/notifications`

Body:
```json
{
  "user_id": 123,
  "actor_id": 456,
  "type": "post_like",
  "content": "John liked your post",
  "reference_type": "post",
  "reference_id": 789
}
```

### Mark Notification as Seen
**PATCH** `/api/notifications/:notificationId/seen`

### Mark All Notifications as Seen
**PATCH** `/api/notifications/mark-all-seen`

### Delete Notification
**DELETE** `/api/notifications/:notificationId`

### Get Unread Count
**GET** `/api/notifications/unread/count`

## Socket.IO Events

### Client Receives

#### new_notification
Emitted when a new notification is created.
```javascript
{
  notification: NotificationObject
}
```

#### unread_notifications_count
Emitted on connection and when notifications are updated.
```javascript
{
  count: number
}
```

## Helper Functions

Use the notification helper functions for easy notification creation:

```javascript
const {
  sendPostLikeNotification,
  sendPostCommentNotification,
  sendCommentReplyNotification,
  sendPostShareNotification,
  sendFollowNotification,
  sendMentionNotification,
  sendFriendRequestNotification,
  sendFriendAcceptNotification,
  sendGroupInviteNotification,
  sendMessageNotification,
} = require('./utils/notificationHelper')
```

### Example Usage

```javascript
// Send a post like notification
await sendPostLikeNotification(
  io,              // Socket.IO instance
  activeUsers,     // Map of active user connections
  postOwnerId,     // User who owns the post
  actorId,         // User who liked the post
  actorUsername,   // Username of the actor
  postId          // ID of the post
)

// Send a follow notification
await sendFollowNotification(
  io,
  activeUsers,
  followedUserId,  // User who is being followed
  actorId,         // User who followed
  actorUsername
)

// Send a comment notification
await sendPostCommentNotification(
  io,
  activeUsers,
  postOwnerId,     // User who owns the post
  actorId,         // User who commented
  actorUsername,
  postId,
  commentId
)
```

## Notification Templates

Pre-defined message templates are available in `utils/notificationHelper.js`:

```javascript
const notificationTemplates = {
  post_like: (actorUsername) => `${actorUsername} liked your post`,
  post_comment: (actorUsername) => `${actorUsername} commented on your post`,
  comment_reply: (actorUsername) => `${actorUsername} replied to your comment`,
  post_share: (actorUsername) => `${actorUsername} shared your post`,
  follow: (actorUsername) => `${actorUsername} started following you`,
  mention: (actorUsername, contentType) => `${actorUsername} mentioned you in a ${contentType}`,
  friend_request: (actorUsername) => `${actorUsername} sent you a friend request`,
  friend_accept: (actorUsername) => `${actorUsername} accepted your friend request`,
  // ... more templates
}
```

## Integration Guide

### Adding Notifications to New Features

1. **Determine the notification type** - Use existing types or request new ones
2. **Use the helper function** - Call the appropriate helper from `notificationHelper.js`
3. **Pass required parameters** - Include io, activeUsers, relevant user IDs, and reference IDs

Example: Adding like functionality to posts
```javascript
// In your post like route handler
const { sendPostLikeNotification } = require('../utils/notificationHelper')

router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  // ... like logic ...

  // Send notification to post owner
  if (post.user_id !== req.user.user_id) {
    await sendPostLikeNotification(
      req.app.get('io'),
      req.app.get('activeUsers'),
      post.user_id,
      req.user.user_id,
      req.user.username,
      postId
    )
  }

  res.json({ success: true })
})
```

### Real-time Delivery

Notifications are delivered in real-time to online users via Socket.IO. Offline users will see notifications when they next connect.

### Database Migration

When deploying this update, ensure the database schema is updated to include the new fields:
- `actor_id` (INTEGER, nullable, foreign key to users)
- `reference_type` (ENUM, nullable)
- `reference_id` (INTEGER, nullable)
- Updated `type` ENUM with new notification types

## Best Practices

1. **Don't notify users of their own actions** - Always check if actor_id === user_id before sending
2. **Use reference fields** - Always include reference_type and reference_id for navigation
3. **Keep content concise** - Notification content should be brief and clear
4. **Aggregate similar notifications** - Consider aggregating multiple notifications of the same type
5. **Respect user preferences** - Consider adding notification preferences in the future

## Future Enhancements

- Notification preferences per user
- Notification grouping and aggregation
- Push notifications for mobile devices
- Email notifications for offline users
- Notification sound customization
