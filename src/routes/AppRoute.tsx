import { Routes, Route } from "react-router-dom";
import ProtectRoute from "@/routes/ProtectRoute";
import MainLayout from "@/components/layout/MainLayout";
import FeedPage from "@/pages/Feed";
import Search from "@/pages/Search";
import ExplorePage from "@/pages/Explore";
import ReelsPage from "@/pages/Reels";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { AuthProvider } from "./AuthRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<FeedPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="search" element={<Search />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="reels" element={<ReelsPage />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:conversation_id" element={<Messages />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
