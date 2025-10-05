import React from 'react';
import StoryCarousel from '@/components/shared/StoryCarousel';
import PostCard from '@/components/shared/PostCard';
import { posts as mockPosts } from '@/data/mock';

const FeedPage = () => {
  return (
    <div className="container mx-auto px-0 md:px-4 py-4 md:py-8 max-w-xl">
      <StoryCarousel />
      <div className="space-y-6">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;