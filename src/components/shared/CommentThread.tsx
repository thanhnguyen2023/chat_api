import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Comment } from '@/data/mock';
import { formatDistanceToNowStrict } from 'date-fns';

interface CommentProps {
  comment: Comment;
  depth?: number;
}

const CommentItem: React.FC<CommentProps> = ({ comment, depth = 0 }) => {
  const timeAgo = formatDistanceToNowStrict(new Date(comment.timestamp), { addSuffix: true });

  return (
    <div className={`flex gap-2 ${depth > 0 ? 'ml-6' : ''}`}>
      <Link to={`/profile/${comment.username}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.avatar} alt={`${comment.username}'s avatar`} />
          <AvatarFallback>{comment.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <p className="text-sm">
          <Link to={`/profile/${comment.username}`} className="font-semibold mr-1">
            {comment.username}
          </Link>
          {comment.text}
        </p>
        <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
          <span>{timeAgo}</span>
          {comment.likes > 0 && <span>{comment.likes} likes</span>}
          <button className="font-semibold">Reply</button>
        </div>
        {comment.replies && comment.replies.map(reply => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
};

interface CommentThreadProps {
  comments: Comment[];
}

const CommentThread: React.FC<CommentThreadProps> = ({ comments }) => {
  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentThread;