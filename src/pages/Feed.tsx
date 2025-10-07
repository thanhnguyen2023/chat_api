import React from "react";
import StoryCarousel from "@/components/shared/StoryCarousel";
import PostCard from "@/components/shared/PostCard";
import { posts as mockPosts } from "@/data/mock";
import { useIsMobile } from "@/hooks/use-mobile";
import RightPanel from "@/components/layout/RightPanel";

const FeedPage = () => {
    const isMobile = useIsMobile();

    return (
        <div className="flex flex-row">
            <div className="flex-[3] min-w-0">
                <StoryCarousel />
                <div className="space-y-6">
                    {mockPosts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </div>

            {/* RightPanel ẩn trên mobile, chỉ hiện ở lg trở lên */}
            <div className="lg:flex-[0] xl:flex-[1] lg:pl-6">
                <RightPanel />
            </div>
        </div>
    );
};

export default FeedPage
