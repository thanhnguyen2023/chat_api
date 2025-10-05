import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { stories as mockStories } from '@/data/mock';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const StoryCarousel = () => {
  return (
    <div className="border-b border-border pb-4 mb-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 p-2">
          {mockStories.map((story) => (
            <div key={story.id} className="flex flex-col items-center flex-shrink-0">
              <div className={`relative p-[2px] rounded-full ${story.isSeen ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'}`}>
                <Avatar className="h-16 w-16 border-2 border-background">
                  <AvatarImage src={story.avatar} alt={`${story.username}'s story`} />
                  <AvatarFallback>{story.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-xs mt-1 max-w-[70px] truncate">{story.username}</p>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default StoryCarousel;