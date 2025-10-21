import React, { useState , useEffect} from "react";
import { Phone, Video, Info, Smile, Mic, Image, Heart } from "lucide-react";
import { useAPI } from '../hooks/useApi';


type MessageConversationProps = {
  conversation_id: number,
  is_group: boolean,
};

const MessageConversation = ({ conversation_id , is_group }: MessageConversationProps) => {
  const [message, setMessage] = useState("");
  const {get, setToken} =  useAPI();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! I'm so glad you're here - thanks a ton for stopping by 😊",
      sender: "other",
      time: "10:30",
    },
    {
      id: 2,
      text: "Tap below and I'll send you the access in just a moment ✨",
      sender: "other",
      time: "10:30",
    },
    {
      id: 3,
      text: "Send me the code",
      sender: "other",
      time: "10:31",
    },
    {
      id: 4,
      text: "Send me the code",
      sender: "user",
      time: "10:32",
    },
    {
      id: 5,
      text: "📌 I share all my coding projects, links, and",
      sender: "other",
      time: "10:32",
    },
  ]);
  useEffect(() => {
    const getMessageConversation = async () => {
    }
  }, [conversation_id])
  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: message,
          sender: "user",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        },
      ]);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white ">
     
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-blue-400 p-0.5">
            <div className="w-full h-full rounded-full bg-white p-0.5">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <div className="text-white text-xs">👨‍🚀</div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-semibold text-sm">
                Stella • Coding • HTML • CSS • JAVASCRIPT
              </h1>
              <svg
                className="w-3 h-3 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">coding.stella</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Phone className="w-5 h-5 text-gray-700" />
          <Video className="w-5 h-5 text-gray-700" />
          <Info className="w-5 h-5 text-gray-700" />
        </div>
      </div>

      <div className="h-[90%]  overflow-y-auto">
       
        <div className="flex flex-col  items-center py-6 border-gray-200">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-blue-400 p-1 mb-3">
            <div className="w-full h-full rounded-full bg-white p-1">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                👨‍🚀
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <h2 className="font-semibold text-sm">
              Stella • Coding • HTML • CSS • JAVASCRIPT
            </h2>
            <svg
              className="w-3 h-3 text-blue-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            coding.stella · Instagram
          </p>
          <button className="px-4 py-1.5 bg-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300">
            Xem trang cá nhân
          </button>
        </div>

        {/* danh sách tin nhắn */}
        <div className="flex-1 px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "other" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs mr-2 flex-shrink-0">
                  👨‍🚀
                </div>
              )}
              <div
                className={`max-w-xs px-4 py-2 rounded-3xl ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input  */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Smile className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              placeholder="Nhắn tin..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Mic className="w-6 h-6 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Image className="w-6 h-6 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Heart className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default MessageConversation;
