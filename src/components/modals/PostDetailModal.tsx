import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Post } from '@/data/mock';
import ImageLazyLoader from '@/components/shared/ImageLazyLoader';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CommentThread from '@/components/shared/CommentThread';
import { formatDistanceToNowStrict } from 'date-fns';

interface PostDetailModalProps {
  post: Post;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post }) => {
  const [commentText, setCommentText] = React.useState('');
  const timeAgo = formatDistanceToNowStrict(new Date(post.timestamp), { addSuffix: true });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      console.log('Comment submitted:', commentText);
      setCommentText('');
 
    }
  };

  return (
    // dialog khi click icon comment post
    <DialogContent className="max-w-4xl p-0 flex flex-col md:flex-row h-[90vh] max-h-[90vh] overflow-hidden">
      <div className="relative w-full md:w-3/5 h-1/2 md:h-full bg-black flex items-center justify-center">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {post.images.map((image, index) => (
              <CarouselItem key={index}>
                <ImageLazyLoader src={image} alt={`Post by ${post.username} - image ${index + 1}`} className="w-full h-full" />
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
      </div>

      <div className="w-full md:w-2/5 flex flex-col border-l border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
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

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <p className="text-sm">
              <Link to={`/profile/${post.username}`} className="font-semibold mr-1">
                {post.username}
              </Link>
              {post.caption}
            </p>
            <p className="text-xs text-muted-foreground uppercase mt-1">{timeAgo}</p>
          </div>
          <CommentThread comments={post.comments} />
        </div>

        {/* Actions and Add Comment */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" aria-label="Like post">
                <Heart className={post.hasLiked ? 'fill-red-500 text-red-500' : 'text-foreground'} size={24} />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Comment on post">
                <MessageCircle size={24} />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Share post">
                <Send size={24} />
              </Button>
            </div>
            <Button variant="ghost" size="icon" aria-label="Bookmark post">
              <Bookmark className={post.isBookmarked ? 'fill-foreground text-foreground' : 'text-foreground'} size={24} />
            </Button>
          </div>
          <p className="font-semibold text-sm mb-3">{post.likes} likes</p>

          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
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
      </div>
    </DialogContent>
  );
};