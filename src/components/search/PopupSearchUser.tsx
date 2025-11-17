import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { useAPI } from "@/hooks/useApi";
import { useUserStore } from "@/stores/UserStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PopupSearchUserProps {
  setOpen?: (open: boolean) => void;
}

const PopupSearchUser = ({ setOpen }: PopupSearchUserProps = {}) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 400);
  const { get, post, setToken } = useAPI();
  const { access_token, user_id } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setToken(access_token);
        const data = await get(
          `/api/users/?page=1&limit=10&search=${encodeURIComponent(
            debouncedSearch
          )}`
        );
        setUsers(data.data?.users || []);
      } catch (err: any) {
        toast.error(
          err?.response?.data?.error?.message || "Lỗi tìm kiếm người dùng"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedSearch, access_token, get, setToken]);

  const handleSelectUser = async (user: any) => {
    if (!user_id) {
      toast.error("Không xác định được người dùng hiện tại");
      return;
    }

    setCreating(user.user_id);

    try {
      setToken(access_token);
      const participant_ids = [user_id, user.user_id];

      const res = await post("/api/conversations", {
        is_group: false,
        participant_ids,
      });

      const conversationId = res.data?.conversation?.conversation_id;
      if (conversationId) {
        setOpen?.(false);
        navigate(`/messages/${conversationId}`, { replace: true });
        return;
      }

      throw new Error("Không nhận được conversation_id");
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("Đang mở cuộc trò chuyện...");
        await redirectToExistingDM(user.user_id);
      } else {
        toast.error(
          error?.response?.data?.error?.message || "Lỗi khi tạo cuộc trò chuyện"
        );
      }
    } finally {
      setCreating(null);
    }
  };

  const redirectToExistingDM = async (otherUserId: string) => {
    try {
      setToken(access_token);
      const data = await get("/api/conversations");
      const conversations = data.data?.conversations || [];

      const existing = conversations.find((conv: any) => {
        return (
          !conv.is_group &&
          Array.isArray(conv.participants) &&
          conv.participants.length === 2 &&
          conv.participants.some((p: any) => p.user_id === user_id) &&
          conv.participants.some((p: any) => p.user_id === otherUserId)
        );
      });

      if (existing?.conversation_id) {
        console.log("abc");
        setOpen?.(false);
        navigate(`/messages/${existing.conversation_id}`, { replace: true });
        return;
      }

      toast.error("Không tìm thấy cuộc trò chuyện.");
    } catch (err) {
      toast.error("Lỗi khi tìm cuộc trò chuyện cũ.");
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Tìm kiếm người dùng</DialogTitle>
        <DialogDescription>
          Nhập tên hoặc username để bắt đầu trò chuyện.
        </DialogDescription>
      </DialogHeader>

      <div>
        <Label htmlFor="search" className="sr-only">
          Tìm kiếm
        </Label>
        <Input
          id="search"
          placeholder="Nhập tên hoặc @username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="mt-2 max-h-[300px] overflow-y-auto">
        {loading && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tìm...
          </p>
        )}

        {!loading && users.length === 0 && debouncedSearch && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Không tìm thấy người dùng.
          </p>
        )}

        <ul className="space-y-2">
          {users.map((user) => {
            const isCreating = creating === user.user_id;
            return (
              <li
                key={user.user_id}
                className={`
                  flex items-center gap-3 p-3 rounded-lg border 
                  hover:bg-accent hover:border-accent-foreground 
                  transition-all cursor-pointer
                  ${isCreating ? "opacity-70" : ""}
                `}
                onClick={() => !isCreating && handleSelectUser(user)}
              >
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.full_name}
                  className="h-10 w-10 rounded-full object-cover border"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
                {isCreating && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <DialogClose asChild>
        <Button variant="outline" className="w-full">
          Đóng
        </Button>
      </DialogClose>
    </div>
  );
};

export default PopupSearchUser;
