import React from 'react';
import { Video } from 'lucide-react';

const ReelsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
      <Video className="h-24 w-24 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Reels</h1>
      <p className="text-muted-foreground text-center">
        Watch and create short, entertaining videos.
      </p>
    </div>
  );
};

export default ReelsPage;