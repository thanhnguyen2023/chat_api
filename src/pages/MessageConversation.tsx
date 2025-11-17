import React, { useState, useEffect, useRef, FormEvent } from "react";
import { Phone, Video, Info, Smile, Mic, Image, Heart } from "lucide-react";
import { useAPI } from "../hooks/useApi";
import {
  GetMessageInConversation,
  ResponePostMessage,
} from "@/types/api/Message.api";
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
import { useSocket } from "@/hooks/useSocket";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";

import { VideoZoom } from "@/components/video/VideoRoom";
import { toast } from "sonner";
import { ErrorAPI } from "@/types/api/Error.api";

type MessageConversationProps = {
  conversation: ConversationDto;
};
type UserTyping = {
  user_id?: number;
  username?: string;
  conversation_id?: number;
};
const MessageConversation = ({ conversation }: MessageConversationProps) => {
  const [messageInput, setMessageInput] = useState(""); // message nhập
  // console.log("conversation >>> ", conversation);
  console.log("route change");
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(true);
  const [userTyping, setUserTyping] = useState<UserTyping>({});
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [selectedFiles, setSelectedFile] = useState<File[] | null>([]);
  const MessageListAreaRef = useRef<HTMLDivElement>();
  const divMessageInput = useRef<HTMLDivElement>();
  const inputFile = useRef<HTMLInputElement>();
  const { user_id, avatar_url, username } = useUserStore(); // user đăng nhập

  const { get, setToken, post } = useAPI();
  const { socket } = useSocket();
  const token = localStorage.getItem("token");

  // const [isSelectOpenEmoji, setIsSelectOpenEmoji] = useState<boolean>(false);
  const getMessageConversation = async () => {
    try {
      setToken(token); // token từ localstoreage , set vào header

      const dataGetMessageApi: GetMessageInConversation = await get(
        `/api/messages/conversation/${conversation.conversation_id}`
        // { signal: controller.signal }
      );

      setMessages(dataGetMessageApi.data.messages);

      setIsLoadingMessage(false);
      if (!MessageListAreaRef.current) return;
      MessageListAreaRef.current.scrollTo({
        top: MessageListAreaRef.current.scrollHeight,
        // behavior: "smooth",
      });
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request bị hủy");
      }
    }
  };
  useEffect(() => {
    if (!MessageListAreaRef.current) return;
    MessageListAreaRef.current.scrollTo({
      top: MessageListAreaRef.current.scrollHeight,
      // behavior: "smooth",
    });
  }, [messages]);
  useEffect(() => {
    // socket.emit("join_conversation", {
    //   conversation_id: conversation.conversation_id,
    // });
    setUserTyping({}); // khi chuyển conversation phải người cho về rỗng
    setIsLoadingMessage(true);
    if (!conversation.conversation_id) return;
    // const controller = new AbortController();

    setTimeout(() => {
      getMessageConversation();
    }, 1500);
  }, [conversation.conversation_id]);

  useEffect(() => {
    if (socket) {
      if (messageInput) {
        socket.emit("typing_start", {
          conversation_id: conversation.conversation_id,
        });
      } else {
        socket.emit("typing_stop", {
          conversation_id: conversation.conversation_id,
        });
      }
    }
  }, [messageInput]);

  useEffect(() => {
    socket.on("user_typing", (user_Typing: UserTyping) => {
      // console.log("Messageconversation.tsx >> User typing" , user_Typing );
      if (user_Typing) setUserTyping(user_Typing);
    });
    socket.on(
      "user_stopped_typing",
      (data: Pick<UserTyping, "user_id" | "conversation_id">) => {
        // phải tạo type cho data
        setUserTyping({});
      }
    );
    socket.on("new_message", (data) => {
      // data phải điền type (chưa fix)
      // console.log("MessageConversaion.tsx >> data event new message : ", data);
      setMessages((oldMessages) => [
        ...oldMessages,
        {
          ...data.message,
          sender: {
            user_id: user_id,
            avatar_url: avatar_url,
            username: username,
          },
          attachments: [],
          statuses: [],
        },
      ]);
    });
    return () => {
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("user_stopped_typing");
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setSelectedFile((pre) => (files.length ? [...pre, ...files] : null));
  };
  const handleRemovePreviewFile = (index: number) => {
    setSelectedFile((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (messageInput == "") return;
    // console.log("click enter");
    setMessageInput("");

    socket.emit("send_message", {
      conversation_id: conversation.conversation_id,
      content: messageInput,
    });
  };
  const handleSendHeart = async (e: FormEvent) => {
    e.preventDefault();

    socket.emit("send_message", {
      conversation_id: conversation.conversation_id,
      content: "❤️",
    });
  };
  const handleSendFileClick = async () => {
    // lấy id message trước
    const dataPostMessage: ResponePostMessage = await post("/api/messages/", {
      conversation_id: conversation.conversation_id,
      content: "!@#",
    });
    // console.log("request 1 >>> : ", dataPostMessage);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });
    setSelectedFile([]);
    setMessages((preMes) => {
      return [
        ...preMes,
        {
          message_id: dataPostMessage.data.message.message_id,
          conversation_id: dataPostMessage.data.message.conversation_id,
          sender_id: dataPostMessage.data.message.sender_id,
          content: dataPostMessage.data.message.content,
          created_at: dataPostMessage.data.message.created_at,
          is_read: dataPostMessage.data.message.is_read,
          attachments: Array.from({ length: selectedFiles?.length }, () => ({
            attachment_id: Math.random(),
            message_id: dataPostMessage.data.message.message_id,
            file_url: "",
            file_type: "image",
            file_size: Math.random(),
            uploaded_at: "",
          })),
          statuses: [],
          sender: dataPostMessage.data.message.sender,
        },
      ];
    });
    const res = await fetch(
      `${server.baseUrl}/api/upload/message/${dataPostMessage.data.message.message_id}`,
      {
        method: "post",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      const errorApi: ErrorAPI = await res.json();
      toast.error("Error", { description: errorApi.error.message });
    }
    const data = await res.json();
    if (data) getMessageConversation();
    // console.log("request 2 >>> : ", res);
  };
  return (
    <div className="flex flex-col h-screen bg-white ">
      <div className="flex flex-1 items-center justify-between px-4 py-3 border-b border-gray-200">
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

      <div className="relative flex-[13]">
        {/* danh sách tin nhắn */}

        {isLoadingMessage ? (
          <ChatSkeleton />
        ) : (
          <div
            ref={MessageListAreaRef}
            className="h-[calc(100vh-150px)] overflow-y-auto"
          >
            {!conversation.is_group && (
              // hiện thị section trang cá nhân ( nếu là ở group thì không có)

              <div className="flex flex-col items-center py-6 border-gray-200">
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

                <button className="px-4 py-1.5 bg-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300">
                  Xem trang cá nhân
                </button>
              </div>
            )}
            <div className="px-4 py-4 space-y-3">
              {messages.map((msg) => (
                <div>
                  {msg.content != "!@#" && (
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
                          <img
                            src={msg.sender.avatar_url}
                            className="w-7 h-7"
                          />
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
                  )}
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
                                className="max-w-96 min-h-52"
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
          </div>
        )}
        {userTyping.username && (
          <div className="absolute left-1 bottom-1 text-gray-600 italic text-[14px]">
            {userTyping.username} đang soạn tin ...{" "}
          </div>
        )}
      </div>

      {/* Section gửi tin nhắn  */}
      <div className="flex-1 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center relative gap-2">
          {/* khi không chọn gửi file nào thì sẽ ẩn emoij picker */}
          {selectedFiles?.length <= 0 && (
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
          )}

          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                className={`${
                  messageInput != "" || selectedFiles?.length > 0
                    ? "w-0"
                    : "p-2"
                } hover:bg-gray-100 rounded-full`}
              >
                <Mic
                  className={`${
                    messageInput != "" || selectedFiles?.length > 0
                      ? "w-0 translate-x-[-35px]"
                      : "w-6 translate-x-0"
                  }  transition-all duration-300  h-6 text-gray-700`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-black">
              <p className="bg-black text-white text-xs">Gửi clip âm thanh</p>
            </TooltipContent>
          </Tooltip>

          {/* Input file hidden */}
          <input
            ref={inputFile}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                className={`${
                  messageInput != "" || selectedFiles?.length > 0
                    ? "w-0"
                    : "p-2"
                }   hover:bg-gray-100 rounded-full`}
                onClick={() => {
                  inputFile.current.click();
                }}
              >
                <Image
                  className={`${
                    messageInput != "" || selectedFiles?.length > 0
                      ? "w-0 translate-x-[-35px]"
                      : "w-6 translate-x-0"
                  } transition-all duration-300  h-6 text-gray-700`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-black">
              <p className="bg-black text-white text-xs">
                Đính kèm file có kích thước tối đa 10MB
              </p>
            </TooltipContent>
          </Tooltip>

          <div className="flex-1 flex justify-between">
            {selectedFiles?.length > 0 ? (
              <div className="flex gap-2 items-center">
                {/* Nút + để mở input */}
                <button
                  onClick={() => inputFile.current?.click()}
                  className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center"
                >
                  <svg width="22" height="22" stroke="currentColor" fill="none">
                    <path
                      d="M12 5v14M5 12h14"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* Preview ảnh */}
                {selectedFiles.map((file, index) => {
                  const isImage = file.type.startsWith("image/");
                  const isVideo = file.type.startsWith("video/");
                  const url = URL.createObjectURL(file);
                  return (
                    <div key={index} className="relative">
                      {/* Nút xoá */}
                      <button
                        onClick={() => handleRemovePreviewFile(index)}
                        className="absolute -top-2 -right-2 bg-white rounded-full shadow p-1 z-10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>

                      {/* Ảnh có zoom */}
                      {isImage && (
                        <ImageZoom>
                          <img
                            src={url}
                            alt=""
                            className="h-10 w-10 rounded-lg object-cover border cursor-pointer"
                          />
                        </ImageZoom>
                      )}
                      {isVideo && <VideoZoom src={url} />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex-1 flex ">
                <div className="flex items-center max-h-32 overflow-y-auto w-[95%] bg-gray-100 rounded-[20px] px-4 py-2">
                  <input
                    placeholder="Nhắn tin..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    // onKeyDown={(e) => e.key === "Enter" && handleSend(e)}
                    className=" max-h-8 w-full break-words whitespace-pre-wrap over bg-transparent outline-none text-sm"
                  />
                </div>

                {messageInput != "" || selectedFiles?.length > 0 ? (
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <svg height="20px" viewBox="0 0 24 24" width="20px">
                      <title>Nhấn Enter để gửi</title>
                      <path
                        d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z"
                        fill="var(--chat-composer-button-color)"
                      ></path>
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSendHeart}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Heart className="w-6 h-6 text-gray-700" />
                  </button>
                )}
              </form>
            )}
            {selectedFiles && ( // button riêng xử lý gửi file
              <button
                onClick={handleSendFileClick}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg height="20px" viewBox="0 0 24 24" width="20px">
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
    </div>
  );
};
export default MessageConversation;
