import React from 'react';
import PostGrid from '@/components/shared/PostGrid';
import { posts as mockPosts } from '@/data/mock';

const ExplorePage = () => {
  return (
    <div className="container mx-auto px-0 md:px-28 py-4 md:py-8">
      <h1 className="text-2xl font-bold mb-6 hidden md:block">Explore</h1>
      <PostGrid posts={mockPosts} />
    </div>
  );
};

export default ExplorePage;