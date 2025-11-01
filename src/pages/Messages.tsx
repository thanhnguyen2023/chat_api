import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { conversations as mockConversations, currentUser } from "@/data/mock";
import { formatDistanceToNowStrict } from "date-fns";
import {
  MessageSquare,
  Edit,
  SquarePen,
  ChevronDown,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { customClass } from "@/styles/style";
import { useUserStore } from "@/stores/UserStore";

import { useAPI } from "../hooks/useApi";
import MessageConversation from "./MessageConversation";
import { ApiConversationRespone } from "@/types/api/Conversation.api";
import { ConversationDto } from "@/types/dtos/Conversation.dto";

import SidebarSkeleton from "@/components/skeletons/SidebarSkeleton";
import { toast } from "sonner";
import { useIsMobile } from "../hooks/use-mobile";
import { useGlobal } from "@/hooks/useGlobal";

const Messages = () => {
  // const { username } = useParams();
  const { username, user_id } = useUserStore();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [isLoadingSidebarChat, setIsLoadingSidebarchat] =
    useState<boolean>(true);
  const access_token = localStorage.getItem("token");
  const { get, setToken } = useAPI();
  const { socket } = useGlobal();
  const isMobile = useIsMobile();
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDto>(null);
  // console.log("Messages.tsx  | user_id " + user_id);

  if (socket) {
    socket.on("status_updated", (data) => {
      // console.log("có người mới online");
      // console.log("Messages.tsx || data : ", data);
      getConversation();
    });
    socket.on("user_status_changed", (data) => {
      // console.log("có người mới online hoặc offline");
      getConversation();
    });
  }
  const getConversation = async () => {
    try {
      // console.log(
      //   "pages/Message.tsx : data api " + JSON.stringify(dataApiRespone)
      // );

      setToken(access_token);
      const dataApiRespone: ApiConversationRespone = await get(
        "/api/conversations"
      );
      setConversations(dataApiRespone.data.conversations);
      setIsLoadingSidebarchat(false);
    } catch (error) {
      toast.error("Error", error.error.message);
      console.log("Error pages/Message.tsx : " + error);
    }
  };
  useEffect(() => {
    setTimeout(() => {
      getConversation();
    }, 1500);
  }, []);
  return (
    <div className="flex border-t border-border h-screen overflow-hidden">
      {/* Sidebar Chat ( danh sách conversation) */}
      <div
        className={`${
          isMobile && "max-w-[100px]"
        } flex-[1] border-r border-border px-0 md:px-4  overflow-y-auto`}
      >
        {isLoadingSidebarChat ? (
          <SidebarSkeleton
            count={8}
            className="flex flex-col h-full justify-around overflow-hidden"
          />
        ) : (
          <div>
            {/* section tên và button edit */}
            <div
              className={`${
                isMobile ? "justify-center" : "justify-between"
              } flex  min-h-[74px] pt-9 px-4 mb-4`}
            >
              {!isMobile && (
                // ở mobile thì ẩn tên , hiện button edit
                <div className="flex items-center justify-between max-w-[200px]">
                  <h6 className="font-bold">{username}</h6>
                  <ChevronDown size={30} strokeWidth={2} />
                </div>
              )}
              <Button variant="ghost" size="icon" aria-label="New message">
                <svg
                  aria-label="Tin nhắn mới"
                  fill="currentColor"
                  height="24"
                  role="img"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <title>Tin nhắn mới</title>
                  <path
                    d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                  <path
                    d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                  <line
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    x1="16.848"
                    x2="20.076"
                    y1="3.924"
                    y2="7.153"
                  ></line>
                </svg>
              </Button>
            </div>
            {/* section search */}
            {/* ở mobile thì ẩn search bar */}
            <div
              className={`${
                isMobile && "hidden"
              } flex items-center gap-2 bg-[whitesmoke] px-4 py-1 mb-4 rounded-full`}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm"
                className="bg-transparent outline-none h-[34px] py-1  text-sm w-full placeholder:text-muted-foreground"
              />
            </div>
            {/* section list conversation */}
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-muted-foreground">
                <MessageSquare className="h-24 w-24 mb-4" />
                <p className="text-lg font-semibold">Chưa có tin nhắn nào</p>
                <p className="text-center">Bắt đầu trò chuyện với bạn bè.</p>
              </div>
            ) : (
              <div className={`space-y-1`}>
                {conversations.map((conversation) => (
                  <Link
                    to={`/messages/${conversation.conversation_name}`}
                    key={conversation.conversation_id}
                    className={`flex items-center gap-4 p-3 hover:bg-muted rounded-lg transition-colors ${
                      username === conversation.conversation_name
                        ? "bg-muted"
                        : ""
                    } ${isMobile && "justify-center"}`}
                    onClick={() => {
                      setSelectedConversation(conversation);
                    }}
                  >
                    <Avatar className={`relative h-12 w-12 overflow-visible`}>
                      <AvatarImage
                        src={
                          conversation.is_group
                            ? ""
                            : conversation.participants[0].user_id == user_id
                            ? conversation.participants[1].avatar_url
                            : conversation.participants[0].avatar_url
                        } // cần fix , api backend không có ảnh conversation
                        alt={`${conversation.conversation_name}'s avatar`}
                      />
                      <AvatarFallback>
                        {conversation.conversation_name
                          ? conversation.conversation_name[0].toUpperCase()
                          : ""}
                      </AvatarFallback>
                      {/* trạng thái online  */}
                      {/* mặc định trạng thái online của group là online , nếu k là group thì check người bên kia */}

                      <div
                        className={`${
                          conversation.is_group
                            ? "bg-green-500 "
                            : conversation.participants[0].user_id != user_id
                            ? conversation.participants[0].status != "online"
                              ? " bg-gray-500 "
                              : " bg-green-500 "
                            : conversation.participants[1].user_id != user_id
                            ? conversation.participants[1].status != "online"
                              ? " bg-gray-500 "
                              : " bg-green-500 "
                            : ""
                        } absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full`}
                      ></div>
                    </Avatar>
                    {isMobile ? (
                      ""
                    ) : (
                      <div className="flex-1 min-w-0">
                        {/* ở mobile thì chỉ hiện mỗi ảnh  */}
                        <p className="font-semibold truncate">
                          {conversation.is_group // nếu là group thì lấy tên của group
                            ? conversation.conversation_name
                            : conversation.participants[0].user_id == user_id // không phải group thì private chat thì lấy tên người kia làm tiêu đề
                            ? conversation.participants[1].username
                            : conversation.participants[0].username}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message == null
                            ? " Chưa có tin nhắn nào"
                            : conversation.last_message.sender.user_id ===
                              user_id
                            ? `Bạn: ${conversation.last_message.content}`
                            : conversation.last_message.sender.username +
                              ": " +
                              conversation.last_message.content}
                          {}
                        </p>
                      </div>
                    )}

                   {!isMobile &&  <p className="text-xs text-muted-foreground flex-shrink-0">
                      {conversation.last_message != null &&
                        formatDistanceToNowStrict(
                          new Date(conversation.last_message.created_at),
                          { addSuffix: true }
                        )}
                    </p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-[3] flex flex-col text-center text-muted-foreground">
        {!selectedConversation ? (
          <>
            <div className="flex flex-col my-auto">
              <div className={`${customClass["combo-flex"]}`}>
                <svg
                  aria-label=""
                  fill="currentColor"
                  height="96"
                  role="img"
                  viewBox="0 0 96 96"
                  width="96"
                >
                  <title></title>
                  <path d="M48 0C21.532 0 0 21.533 0 48s21.532 48 48 48 48-21.532 48-48S74.468 0 48 0Zm0 94C22.636 94 2 73.364 2 48S22.636 2 48 2s46 20.636 46 46-20.636 46-46 46Zm12.227-53.284-7.257 5.507c-.49.37-1.166.375-1.661.005l-5.373-4.031a3.453 3.453 0 0 0-4.989.921l-6.756 10.718c-.653 1.027.615 2.189 1.582 1.453l7.257-5.507a1.382 1.382 0 0 1 1.661-.005l5.373 4.031a3.453 3.453 0 0 0 4.989-.92l6.756-10.719c.653-1.027-.615-2.189-1.582-1.453ZM48 25c-12.958 0-23 9.492-23 22.31 0 6.706 2.749 12.5 7.224 16.503.375.338.602.806.62 1.31l.125 4.091a1.845 1.845 0 0 0 2.582 1.629l4.563-2.013a1.844 1.844 0 0 1 1.227-.093c2.096.579 4.331.884 6.659.884 12.958 0 23-9.491 23-22.31S60.958 25 48 25Zm0 42.621c-2.114 0-4.175-.273-6.133-.813a3.834 3.834 0 0 0-2.56.192l-4.346 1.917-.118-3.867a3.833 3.833 0 0 0-1.286-2.727C29.33 58.54 27 53.209 27 47.31 27 35.73 36.028 27 48 27s21 8.73 21 20.31-9.028 20.31-21 20.31Z"></path>
                </svg>
              </div>
              <div className={`${customClass["combo-flex"]}`}>
                <h2 className="text-xl font-semibold mb-1">Tin nhắn của bạn</h2>
              </div>
              <div className={`${customClass["combo-flex"]}`}>
                <p className="text-sm mb-4">
                  Gửi ảnh và tin nhắn riêng tư cho bạn bè hoặc nhóm
                </p>
              </div>
              <div className={`${customClass["combo-flex"]}`}>
                <Button>Gửi tin nhắn</Button>
              </div>
            </div>
          </>
        ) : (
          <MessageConversation conversation={selectedConversation} />
        )}
      </div>
    </div>
  );
};

export default Messages;
