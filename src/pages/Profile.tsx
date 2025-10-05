import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Grid, List, Bookmark, Settings } from 'lucide-react';
import { users as mockUsers, posts as mockPosts, currentUser as mockCurrentUser } from '@/data/mock';
import PostGrid from '@/components/shared/PostGrid';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const isCurrentUserProfile = username === mockCurrentUser.username;
  const user = mockUsers.find(u => u.username === username);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-muted-foreground">The user @{username} does not exist.</p>
        <Link to="/feed" className="mt-4 text-blue-500 hover:underline">Back to Home</Link>
      </div>
    );
  }

  const userPosts = mockPosts.filter(post => post.userId === user.id);

  return (
    <div className="container mx-auto px-0 md:px-4 py-4 md:py-8 max-w-3xl">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 px-4 sm:px-0">
        <Avatar className="h-28 w-28 sm:h-40 sm:w-40">
          <AvatarImage src={user.avatar} alt={`${user.username}'s profile picture`} />
          <AvatarFallback className="text-4xl">{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:justify-start gap-2 sm:gap-4 mb-4">
            <h1 className="text-2xl font-semibold">{user.username}</h1>
            {isCurrentUserProfile ? (
              <div className="flex gap-2">
                <Button variant="secondary" className="px-4">Edit Profile</Button>
                <Button variant="ghost" size="icon" aria-label="Settings">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button className="px-4">Follow</Button>
                <Button variant="secondary" className="px-4">Message</Button>
              </div>
            )}
          </div>
          <div className="flex justify-center sm:justify-start gap-6 mb-4">
            <p className="text-base">
              <span className="font-semibold">{user.postsCount}</span> posts
            </p>
            <p className="text-base">
              <span className="font-semibold">{user.followers.toLocaleString()}</span> followers
            </p>
            <p className="text-base">
              <span className="font-semibold">{user.following}</span> following
            </p>
          </div>
          <div className="text-sm">
            <p className="font-semibold">{user.fullName}</p>
            <p>{user.bio}</p>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Post Navigation */}
      <div className="flex justify-center gap-10 mb-6">
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none -mt-px pt-px" data-state="active">
          <Grid className="h-4 w-4" />
          <span className="hidden sm:inline">POSTS</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none -mt-px pt-px">
          <Bookmark className="h-4 w-4" />
          <span className="hidden sm:inline">SAVED</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:border-t-2 data-[state=active]:border-foreground rounded-none -mt-px pt-px">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">TAGGED</span>
        </Button>
      </div>

      {/* User Posts Grid */}
      {userPosts.length > 0 ? (
        <PostGrid posts={userPosts} />
      ) : (
        <div className="text-center text-muted-foreground py-10">
          <p className="text-lg font-semibold">No Posts Yet</p>
          <p>When {user.username} shares photos, they'll appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;