import React from 'react';
import { Heart } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
      <Heart className="h-24 w-24 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Activity</h1>
      <p className="text-muted-foreground text-center">
        When someone likes or comments on one of your posts, you'll see it here.
      </p>
    </div>
  );
};

export default NotificationsPage;