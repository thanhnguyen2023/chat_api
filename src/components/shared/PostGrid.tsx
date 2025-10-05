import React from 'react';
import { Post } from '@/data/mock';
import ImageLazyLoader from './ImageLazyLoader';
import { MessageCircle, Heart } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { PostDetailModal } from '@/components/modals/PostDetailModal';

interface PostGridProps {
  posts: Post[];
}

const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4">
      {posts.map((post) => (
        <Dialog key={post.id}>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer aspect-square">
              <ImageLazyLoader src={post.images[0]} alt={`Post by ${post.username}`} className="w-full h-full" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-600">
                <div className="flex items-center text-white font-bold text-lg space-x-4">
                  <span className="flex items-center gap-1">
                    <Heart className="fill-white" size={20} /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="fill-white" size={20} /> {post.comments.length}
                  </span>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <PostDetailModal post={post} />
        </Dialog>
      ))}
    </div>
  );
};

export default PostGrid;