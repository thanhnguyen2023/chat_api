import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Compass, Video, Heart, PlusSquare, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { CreatePostModal } from '@/components/modals/CreatePostModal';

const BottomMobileNav = () => {
  const { currentUser } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 p-3 md:hidden">
      <div className="container mx-auto flex justify-around items-center">
        <Link to="/feed" aria-label="Feed">
          <Home className="h-6 w-6" />
        </Link>
        <Link to="/explore" aria-label="Explore">
          <Search className="h-6 w-6" />
        </Link>
        <Dialog>
          <DialogTrigger asChild>
            <button className="p-2" aria-label="Create new post">
              <PlusSquare className="h-6 w-6" />
            </button>
          </DialogTrigger>
          <CreatePostModal />
        </Dialog>
        <Link to="/reels" aria-label="Reels">
          <Video className="h-6 w-6" />
        </Link>
        <Link to={`/profile/${currentUser.username}`} aria-label="Profile">
          <Avatar className="h-6 w-6">
            <AvatarImage src={currentUser.avatar} alt={`${currentUser.username}'s profile picture`} />
            <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </nav>
  );
};

export default BottomMobileNav;