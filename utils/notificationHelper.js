const { Notification } = require("../models")

const createAndSendNotification = async (io, activeUsers, {
  userId,
  actorId = null,
  type,
  content,
  referenceType = null,
  referenceId = null,
}) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      actor_id: actorId,
      type,
      content,
      reference_type: referenceType,
      reference_id: referenceId,
    })

    const targetSocketId = activeUsers.get(userId)
    if (targetSocketId && io) {
      io.to(targetSocketId).emit("new_notification", { notification })

      const unreadCount = await Notification.count({
        where: {
          user_id: userId,
          is_seen: false,
        },
      })
      io.to(targetSocketId).emit("unread_notifications_count", { count: unreadCount })
    }

    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

const notificationTemplates = {
  post_like: (actorUsername) => `${actorUsername} liked your post`,
  post_comment: (actorUsername) => `${actorUsername} commented on your post`,
  comment_reply: (actorUsername) => `${actorUsername} replied to your comment`,
  post_share: (actorUsername) => `${actorUsername} shared your post`,
  follow: (actorUsername) => `${actorUsername} started following you`,
  mention: (actorUsername, contentType) => `${actorUsername} mentioned you in a ${contentType}`,
  friend_request: (actorUsername) => `${actorUsername} sent you a friend request`,
  friend_accept: (actorUsername) => `${actorUsername} accepted your friend request`,
  group_invite: (actorUsername, groupName) => `${actorUsername} invited you to join ${groupName}`,
  new_message: (actorUsername, conversationName) =>
    conversationName ? `New message in ${conversationName} from ${actorUsername}` : `New message from ${actorUsername}`,
}

const sendPostLikeNotification = async (io, activeUsers, postOwnerId, actorId, actorUsername, postId) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: postOwnerId,
    actorId,
    type: "post_like",
    content: notificationTemplates.post_like(actorUsername),
    referenceType: "post",
    referenceId: postId,
  })
}

const sendPostCommentNotification = async (io, activeUsers, postOwnerId, actorId, actorUsername, postId, commentId) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: postOwnerId,
    actorId,
    type: "post_comment",
    content: notificationTemplates.post_comment(actorUsername),
    referenceType: "post",
    referenceId: postId,
  })
}

const sendCommentReplyNotification = async (io, activeUsers, commentOwnerId, actorId, actorUsername, commentId) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: commentOwnerId,
    actorId,
    type: "comment_reply",
    content: notificationTemplates.comment_reply(actorUsername),
    referenceType: "comment",
    referenceId: commentId,
  })
}

const sendPostShareNotification = async (io, activeUsers, postOwnerId, actorId, actorUsername, postId) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: postOwnerId,
    actorId,
    type: "post_share",
    content: notificationTemplates.post_share(actorUsername),
    referenceType: "post",
    referenceId: postId,
  })
}

const sendFollowNotification = async (io, activeUsers, followedUserId, actorId, actorUsername) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: followedUserId,
    actorId,
    type: "follow",
    content: notificationTemplates.follow(actorUsername),
    referenceType: "user",
    referenceId: actorId,
  })
}

const sendMentionNotification = async (io, activeUsers, mentionedUserId, actorId, actorUsername, referenceType, referenceId, contentType) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: mentionedUserId,
    actorId,
    type: "mention",
    content: notificationTemplates.mention(actorUsername, contentType),
    referenceType,
    referenceId,
  })
}

const sendFriendRequestNotification = async (io, activeUsers, targetUserId, actorId, actorUsername) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: targetUserId,
    actorId,
    type: "friend_request",
    content: notificationTemplates.friend_request(actorUsername),
    referenceType: "user",
    referenceId: actorId,
  })
}

const sendFriendAcceptNotification = async (io, activeUsers, targetUserId, actorId, actorUsername) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: targetUserId,
    actorId,
    type: "friend_accept",
    content: notificationTemplates.friend_accept(actorUsername),
    referenceType: "user",
    referenceId: actorId,
  })
}

const sendGroupInviteNotification = async (io, activeUsers, targetUserId, actorId, actorUsername, conversationId, groupName) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: targetUserId,
    actorId,
    type: "group_invite",
    content: notificationTemplates.group_invite(actorUsername, groupName),
    referenceType: "conversation",
    referenceId: conversationId,
  })
}

const sendMessageNotification = async (io, activeUsers, targetUserId, actorId, actorUsername, messageId, conversationName = null) => {
  return await createAndSendNotification(io, activeUsers, {
    userId: targetUserId,
    actorId,
    type: "new_message",
    content: notificationTemplates.new_message(actorUsername, conversationName),
    referenceType: "message",
    referenceId: messageId,
  })
}

module.exports = {
  createAndSendNotification,
  notificationTemplates,
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
}
