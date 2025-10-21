// import { createBrowserRouter } from "react-router";
// import { RouterProvider } from "react-router/dom";
// import { createRoot } from "react-dom/client";

// const router = createBrowserRouter(routes);
// createRoot(document.getElementById("root")).render(
//   <RouterProvider router={router} />
// );

import MainLayout from "@/components/layout/MainLayout";
import ExplorePage from "@/pages/Explore";
import FeedPage from "@/pages/Feed";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import MessageConversation from "@/pages/MessageConversation";
import Messages from "@/pages/Messages";
import ReelsPage from "@/pages/Reels";
import Search from "@/pages/Search";
import { createBrowserRouter } from "react-router-dom";
import ProtectRoute from "./ProtectRoute";
import NotFound from "@/pages/NotFound";

const routes = createBrowserRouter(
    [
        {
            path:'/',
            element: <ProtectRoute> <MainLayout /></ProtectRoute>,
            children:[
                {   
                    index:true,
                    path:"/",
                    element: <FeedPage />
                },
                {   
                    path:"/feed",
                    element: <FeedPage />
                },
                {   
                    path:"/search",
                    element: <Search />
                },
                {   
                    path:"/explore",
                    element: <ExplorePage />
                },
                {   
                    path:"/reels",
                    element: <ReelsPage />
                },
                {   
                    path:"/messages",
                    element: <Messages />
                },
                 {   
                    path:"/messages/:username",
                    element: <Messages />
                },
            ]

        },
        {
            path:'/login',
            element: <Login />
        },
        {
            path:'*',
            element : <NotFound />
        }
    ]
);

export default routes