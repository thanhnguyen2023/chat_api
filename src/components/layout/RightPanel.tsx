import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { users as mockUsers } from '@/data/mock';
import { useUserStore } from '@/stores/UserStore';

const RightPanel = () => {
  const {username,avatar_url} = useUserStore();
  const suggestions = mockUsers.filter(user => user.id !== '0').slice(0, 5);
  console.log('Log RightPanel.tsx >> username : ' + username);
  return (
    <aside className="hidden lg:flex flex-col p-6 sticky top-0 right-0 pt-8 h-screen bg-background">
      <div className="flex items-center justify-between mb-6">
        <Link to={`/profile/${username}`} className="flex items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatar_url} alt={`${username}'s profile picture`} />
            <AvatarFallback>{username.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{username}</p>
            {/* <p className="text-muted-foreground text-sm">{username}</p> */}
          </div>
        </Link>
        <Button variant="link" className="text-blue-500 text-xs font-semibold p-0 h-auto">
          Switch
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <p className="text-muted-foreground text-sm font-semibold">Suggestions for you</p>
          <Button variant="link" className="text-xs font-semibold p-0 h-auto">
            See All
          </Button>
        </div>
        <div className="space-y-4">
          {suggestions.map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <Link to={`/profile/${user.username}`} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={`${user.username}'s profile picture`} />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{user.username}</p>
                  <p className="text-muted-foreground text-xs">Suggested for you</p>
                </div>
              </Link>
              <Button variant="link" className="text-blue-500 text-xs font-semibold p-0 h-auto">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;