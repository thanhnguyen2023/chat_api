import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import RightPanel from "./RightPanel";
import BottomMobileNav from "./BottomMobileNav";

const MainLayout = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location.pathname);
  const [isIndex, setIsIndex] = useState(true);
  const [isLocationChat, setIsLocationChat] = useState(false);

  useEffect(() => {
    if (!location.pathname.includes("index")) {
      setIsIndex(false);
    }
    if(location.pathname.includes("messages")){
      setIsLocationChat(true);
    }
    else setIsLocationChat(false);  
  }, [location]);
  return (
    <div>
      <div className="flex min-h-screen bg-background">
        <Sidebar isLocationChat = {isLocationChat} />
        <main className="flex-[4] pt-[56px] md:pt-0 pb-[72px] md:pb-0">
          {/* {isIndex ? (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Loading...</h1>
                <p className="text-xl text-gray-600">
                  Redirecting ... 
                </p>
              </div>
            </div>
          ) : ( */}
            <Outlet />
          {/* )} */}
        </main>
      </div>
      {isMobile && <BottomMobileNav />}
    </div>
  );
};

export default MainLayout;
