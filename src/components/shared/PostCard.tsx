import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Post } from '@/data/mock';
import { formatDistanceToNowStrict } from 'date-fns';
import ImageLazyLoader from './ImageLazyLoader';
import LikeAnimation from './LikeAnimation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PostDetailModal } from '@/components/modals/PostDetailModal';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [commentText, setCommentText] = useState('');

  const timeAgo = formatDistanceToNowStrict(new Date(post.timestamp), { addSuffix: true });

  const handleLikeToggle = () => {
    setHasLiked(prev => !prev);
    setLikesCount(prev => (hasLiked ? prev - 1 : prev + 1));
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(prev => !prev);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      console.log('Comment submitted:', commentText);
      setCommentText('');
      // In a real app, you'd add this to mock data or send to backend
    }
  };

  return (
    <article className="bg-card border border-border rounded-lg shadow-sm mb-6 max-w-xl mx-auto">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.username}`}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={post.avatar} alt={`${post.username}'s profile picture`} />
              <AvatarFallback>{post.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <Link to={`/profile/${post.username}`} className="font-semibold text-sm">
              {post.username}
            </Link>
            {post.location && <p className="text-xs text-muted-foreground">{post.location}</p>}
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="More options">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Post Media */}
      <LikeAnimation isLiked={hasLiked} onDoubleClick={handleLikeToggle}>
        <Carousel className="w-full bg-black">
          <CarouselContent>
            {post.images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-square w-full">
                  <ImageLazyLoader src={image} alt={`Post by ${post.username} - image ${index + 1}`} className="w-full h-full" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {post.images.length > 1 && (
            <>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </>
          )}
        </Carousel>
      </LikeAnimation>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={handleLikeToggle} aria-label={hasLiked ? "Unlike post" : "Like post"}>
              <Heart className={hasLiked ? 'fill-red-500 text-red-500' : 'text-foreground'} size={24} />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="View comments">
                  <MessageCircle size={24} />
                </Button>
              </DialogTrigger>
              <PostDetailModal post={post} />
            </Dialog>
            <Button variant="ghost" size="icon" aria-label="Share post">
              <Send size={24} />
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={handleBookmarkToggle} aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}>
            <Bookmark className={isBookmarked ? 'fill-foreground text-foreground' : 'text-foreground'} size={24} />
          </Button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold text-sm mb-2">{likesCount} likes</p>

        {/* Caption */}
        <p className="text-sm mb-2">
          <Link to={`/profile/${post.username}`} className="font-semibold mr-1">
            {post.username}
          </Link>
          {post.caption}
        </p>

        {/* View all comments */}
        {post.comments.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground mb-2">
                View all {post.comments.length} comments
              </Button>
            </DialogTrigger>
            <PostDetailModal post={post} />
          </Dialog>
        )}

        {/* Time Ago */}
        <p className="text-xs text-muted-foreground uppercase mb-3">{timeAgo}</p>

        {/* Add Comment Input */}
        <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 border-t border-border pt-3">
          <Input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 border-none focus-visible:ring-0"
          />
          <Button type="submit" variant="link" className="text-blue-500 font-semibold p-0 h-auto" disabled={!commentText.trim()}>
            Post
          </Button>
        </form>
      </div>
    </article>
  );
};

export default PostCard;