import React, { useState, useEffect } from "react";
import { Phone, Video, Info, Smile, Mic, Image, Heart } from "lucide-react";
import { useAPI } from "../hooks/useApi";
import { GetMessageInConversation } from "@/types/api/Message.api";
import { MessageDto } from "@/types/dtos/Message.dto";
import { ConversationDto } from "@/types/dtos/Conversation.dto";
import { useUserStore } from "@/stores/UserStore";
<<<<<<< HEAD
=======
import ChatSkeleton from "@/components/skeletons/ChatSkeleton";
>>>>>>> master

type MessageConversationProps = {
  conversation: ConversationDto;
};

const MessageConversation = ({ conversation }: MessageConversationProps) => {
  const [messageInput, setMessageInput] = useState("");
  const { user_id } = useUserStore(); // user đăng nhập
  const { get, setToken } = useAPI();
  const token = localStorage.getItem("token");
  const [messages, setMessages] = useState<MessageDto[]>([]);
<<<<<<< HEAD
=======
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(true);
>>>>>>> master
  useEffect(() => {
    setIsLoadingMessage(true);
    if (!conversation.conversation_id) return;
    const controller = new AbortController();

    const getMessageConversation = async () => {
<<<<<<< HEAD
      setToken(token);
      const dataGetMessageApi: GetMessageInConversation = await get(
        `/api/messages/conversation/${conversation.conversation_id}`
      );
      setMessages((pre) => [...pre, ...dataGetMessageApi.data.messages]); //
      setMessages(dataGetMessageApi.data.messages);
    };
    getMessageConversation();
  }, [conversation]);
=======
      try {
        setToken(token); // token từ localstoreage , set vào header

        const dataGetMessageApi: GetMessageInConversation = await get(
          `/api/messages/conversation/${conversation.conversation_id}`,
          { signal: controller.signal }
        );

        setMessages(dataGetMessageApi.data.messages);
        setIsLoadingMessage(false);
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("Request bị hủy");
        }
      }
    };

    setTimeout(() => {
      getMessageConversation();
    }, 1500);

    return () => {
      controller.abort(); // hủy request khi unmount hoặc conversation thay đổi
    };
  }, [conversation.conversation_id]);

>>>>>>> master
  const handleSend = () => {
    // if (message.trim()) {
    //   setMessages([
    //     ...messages,
    //     {
    //       id: messages.length + 1,
    //       text: message,
    //       sender: "user",
    //       time: new Date().toLocaleTimeString("en-US", {
    //         hour: "2-digit",
    //         minute: "2-digit",
    //         hour12: false,
    //       }),
    //     },
    //   ]);
    //   setMessage("");
    // }
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
                {conversation.is_group // nếu là group thì lấy tên của group
                  ? conversation.conversation_name
                  : conversation.participants[0].user_id == user_id // không phải group thì private chat thì lấy tên người kia làm tiêu đề
                  ? conversation.participants[1].username
                  : conversation.participants[0].username}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Phone className="w-5 h-5 text-gray-700" />
          <Video className="w-5 h-5 text-gray-700" />
          <Info className="w-5 h-5 text-gray-700" />
        </div>
      </div>

      <div className="h-[90%]  overflow-y-auto">
        {conversation.is_group ? (
          ""
        ) : (
<<<<<<< HEAD
=======
          // hiện thị section trang cá nhân ( nếu là ở group thì không có)
>>>>>>> master
          <div className="flex flex-col  items-center py-6 border-gray-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-blue-400 p-1 mb-3">
              <div className="w-full h-full rounded-full bg-white p-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                  <img
<<<<<<< HEAD
                    src={ 
=======
                    src={
>>>>>>> master
                      conversation.participants[0].user_id == user_id // không phải group thì private chat thì lấy link người kia làm tiêu đề
                        ? conversation.participants[1].avatar_url
                        : conversation.participants[0].avatar_url
                    }
                    className="w-full h-full rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <h2 className="font-semibold text-sm">
                {conversation.participants[0].user_id == user_id // không phải group thì private chat thì lấy tên người kia làm tiêu đề
                  ? conversation.participants[1].username
                  : conversation.participants[0].username}
              </h2>
              <svg
                className="w-3 h-3 text-blue-500"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            {/* <p className="text-xs text-gray-500 mb-3">
              coding.stella · Instagram
            </p> */}
            <button className="px-4 py-1.5 bg-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300">
              Xem trang cá nhân
            </button>
          </div>
        )}

        {/* danh sách tin nhắn */}
<<<<<<< HEAD
        <div className="flex-1 px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.message_id}
              className={`flex ${
                msg.sender.user_id === user_id ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender.user_id != user_id && (
                <div className="w-7 h-7 rounded-full ">
                  <img src={msg.sender.avatar_url} className="w-7 h-7" />
                </div>
              )}
              <div
                className={`max-w-xs px-4 py-2 rounded-3xl ${
                  msg.sender.user_id === user_id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
=======
        {isLoadingMessage ? (
          <ChatSkeleton />
        ) : (
          <div className="flex-1 px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.message_id}
                className={`flex ${
                  msg.sender.user_id === user_id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {msg.sender.user_id != user_id && (
                  <div className="w-7 h-7 rounded-full ">
                    <img src={msg.sender.avatar_url} className="w-7 h-7" />
                  </div>
                )}
                <div
                  className={`max-w-xs px-4 py-2 rounded-3xl ${
                    msg.sender.user_id === user_id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
>>>>>>> master
              </div>
            ))}
          </div>
        )}
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
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
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
