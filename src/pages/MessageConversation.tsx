import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, MoreHorizontal } from 'lucide-react';
import { conversations as mockConversations, currentUser, Message } from '@/data/mock';
import { format } from 'date-fns';

const MessageConversation = () => {
  const { username } = useParams<{ username: string }>();
  const conversation = mockConversations.find(conv => conv.otherUser.username === username);
  const [messages, setMessages] = useState<Message[]>(conversation?.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages);
    }
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
        <h1 className="text-2xl font-bold mb-2">Conversation Not Found</h1>
        <p className="text-muted-foreground">The conversation with {username} could not be found.</p>
        <Link to="/messages" className="mt-4 text-blue-500 hover:underline">Back to Messages</Link>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: Math.random().toString(36).substring(2, 15),
        senderId: currentUser.id,
        receiverId: conversation.otherUser.id,
        text: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');

    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen max-w-xl mx-auto border-x border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <Link to="/messages" className="md:hidden">
          <Button variant="ghost" size="icon" aria-label="Back to messages">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <Link to={`/profile/${conversation.otherUser.username}`} className="flex items-center gap-3 flex-1 ml-2">
          <Avatar className="h-9 w-9">
            <AvatarImage src={conversation.otherUser.avatar} alt={`${conversation.otherUser.username}'s avatar`} />
            <AvatarFallback>{conversation.otherUser.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{conversation.otherUser.username}</span>
        </Link>
        <Button variant="ghost" size="icon" aria-label="More options">
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-xl ${
                msg.senderId === currentUser.id
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-muted text-foreground rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-75 mt-1">
                {format(new Date(msg.timestamp), 'p')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-background flex items-center gap-2">
        <Input
          type="text"
          placeholder="Message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-full pr-10"
        />
        <Button type="submit" size="icon" className="rounded-full" disabled={!newMessage.trim()} aria-label="Send message">
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default MessageConversation;