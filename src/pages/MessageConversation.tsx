import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  Video,
  Info,
  Smile,
  Mic,
  Image,
  Heart,
  Send,
  SendHorizontal,
} from "lucide-react";
import { useAPI } from "../hooks/useApi";
import { GetMessageInConversation } from "@/types/api/Message.api";
import { MessageDto } from "@/types/dtos/Message.dto";
import { ConversationDto } from "@/types/dtos/Conversation.dto";
import { useUserStore } from "@/stores/UserStore";
import EmojiPicker from "emoji-picker-react";
import ChatSkeleton from "@/components/skeletons/ChatSkeleton";
import { formatDistanceToNowStrict } from "date-fns";
import { Attachment } from "@/types/entites/Attachment";
import { server } from "@/utils/server";
import ImageLazyLoader from "@/components/shared/ImageLazyLoader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type MessageConversationProps = {
  conversation: ConversationDto;
};

const MessageConversation = ({ conversation }: MessageConversationProps) => {
  const [messageInput, setMessageInput] = useState(""); // message nhập
  const divMessageInput = useRef<HTMLDivElement>();
  const { user_id } = useUserStore(); // user đăng nhập
  const { get, setToken } = useAPI();
  const token = localStorage.getItem("token");
  const [messages, setMessages] = useState<MessageDto[]>([]);
  // const [isSelectOpenEmoji, setIsSelectOpenEmoji] = useState<boolean>(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(true);

  useEffect(() => {
    setIsLoadingMessage(true);
    if (!conversation.conversation_id) return;
    const controller = new AbortController();

    const getMessageConversation = async () => {
      try {
        setToken(token); // token từ localstoreage , set vào header

        const dataGetMessageApi: GetMessageInConversation = await get(
          `/api/messages/conversation/${conversation.conversation_id}`,
          { signal: controller.signal }
        );

        setMessages(dataGetMessageApi.data.messages);

        setIsLoadingMessage(false);
      } catch (error) {
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

  const handleSend = () => {

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
        {conversation.is_group && (
          // hiện thị section trang cá nhân ( nếu là ở group thì không có)

          <div className="flex flex-col  items-center py-6 border-gray-200">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-blue-400 p-1 mb-3">
              <div className="w-full h-full rounded-full bg-white p-1">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl">
                  <img
                    src={
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

        {isLoadingMessage ? (
          <ChatSkeleton />
        ) : (
          <div className="flex-1 px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div>
                <div
                  key={msg.message_id}
                  className={`flex ${
                    msg.sender.user_id === user_id
                      ? "justify-end"
                      : "justify-start"
                  } mb-3`}
                >
                  {msg.sender.user_id != user_id && (
                    <div className="w-7 h-7 rounded-full ">
                      <img src={msg.sender.avatar_url} className="w-7 h-7" />
                    </div>
                  )}
                  <div
                    className={`max-w-xs px-4 py-2 rounded-3xl ${
                      msg.sender.user_id === user_id
                        ? "bg-[#1e5bf7] text-white"
                        : "bg-[rgb(240,240,240)] text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>

                    <p
                      className={`text-[10px] italic ${
                        msg.sender.user_id === user_id
                          ? "text-right text-gray-300"
                          : "text-left text-[#999]"
                      } `}
                    >
                      {formatDistanceToNowStrict(msg.created_at, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                {msg.attachments.length != 0 &&
                  msg.attachments.map((file: Attachment) => {
                    // console.log(`abc ${server.baseUrlResource}${file.file_url}`);
                    return (
                      <div
                        key={msg.message_id}
                        className={`flex ${
                          msg.sender.user_id === user_id
                            ? "justify-end"
                            : "justify-start"
                        } mb-3`}
                      >
                        {file.file_type == "audio" && (
                          <audio controls>
                            <source
                              src={`${server.baseUrlResource}${file.file_url}`}
                            />
                          </audio>
                        )}
                        {file.file_type == "image" && (
                          <>
                            <ImageLazyLoader
                              src={`${server.baseUrlResource}${file.file_url}`}
                              alt=""
                              className="max-w-96"
                            />
                          </>
                        )}
                        {file.file_type == "video" && (
                          <>
                            <video
                              src={`${server.baseUrlResource}${file.file_url}`}
                              controls
                              className="max-w-96"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input  */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center relative gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Smile className="w-6 h-6 text-gray-700" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="!h-200px">
              <EmojiPicker
                lazyLoadEmojis={true}
                onEmojiClick={(dataEmoji) => {
                  setMessageInput((pre) => pre + dataEmoji.emoji);
                }}
                className="!h-[400px] !w-full"
              />
            </PopoverContent>
          </Popover>
          <button className={`${messageInput ? "w-0" : "p-2"}  hover:bg-gray-100 rounded-full`}>
            <Mic className={`${messageInput ? "w-0 translate-x-[-35px]" : "w-6 translate-x-0"}  transition-all duration-300  h-6 text-gray-700`}/>
          </button>
          <button className={`${messageInput ? "w-0" : "p-2"} hover:bg-gray-100 rounded-full`}>
            <Image className={`${messageInput ? "w-0 translate-x-[-35px]" : "w-6 translate-x-0"} transition-all duration-300  h-6 text-gray-700`} />
          </button>
          <div className="flex-1 flex items-center max-h-32 overflow-y-auto bg-gray-100 rounded-[20px] px-4 py-2">
            <textarea
              placeholder="Nhắn tin..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 break-words whitespace-pre-wrap over bg-transparent outline-none text-sm"
            />
          </div>

          {!messageInput ? (
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className="w-6 h-6 text-gray-700" />
            </button>
          ) : (
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <svg
                height="20px"
                viewBox="0 0 24 24"
                width="20px"
              >
                <title>Nhấn Enter để gửi</title>
                <path
                  d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"
                  fill="var(--chat-composer-button-color)"
                ></path>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default MessageConversation;
