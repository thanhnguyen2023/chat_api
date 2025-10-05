import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { conversations as mockConversations, currentUser } from '@/data/mock';
import { formatDistanceToNowStrict } from 'date-fns';
import { MessageSquare, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Messages = () => {
  return (
    <div className="container mx-auto px-0 md:px-4 py-4 md:py-8 max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button variant="ghost" size="icon" aria-label="New message">
          <Edit className="h-6 w-6" />
        </Button>
      </div>

      {mockConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-muted-foreground">
          <MessageSquare className="h-24 w-24 mb-4" />
          <p className="text-lg font-semibold">No messages yet</p>
          <p className="text-center">Start a conversation with your friends.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mockConversations.map(conversation => (
            <Link to={`/messages/${conversation.otherUser.username}`} key={conversation.id} className="flex items-center gap-4 p-3 hover:bg-muted rounded-lg transition-colors">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.otherUser.avatar} alt={`${conversation.otherUser.username}'s avatar`} />
                <AvatarFallback>{conversation.otherUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{conversation.otherUser.username}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage.senderId === currentUser.id ? 'You: ' : ''}
                  {conversation.lastMessage.text}
                </p>
              </div>
              <p className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNowStrict(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;