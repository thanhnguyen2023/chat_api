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
              <svg aria-label="Khám phá" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24"><title>Khám phá</title><polygon fill="none" points="13.941 13.953 7.581 16.424 10.06 10.056 16.42 7.585 13.941 13.953" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon><polygon fillRule="evenodd" points="10.06 10.056 13.949 13.945 7.581 16.424 10.06 10.056"></polygon><circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
            </svg>
        </Link>
         <Link to="/search" aria-label="Search">
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