import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

// chuyển hết logic sang file components/layout/MainLayout

const Index = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  // console.log(location.pathname);
  // const [isIndex, setIsIndex] = useState(true);
  useEffect(() => {
    navigate("/feed");
  }, [navigate]);

  // useEffect(() => {
  //   if (!location.pathname.includes("index")) {
  //     setIsIndex(false);
  //   }
  // }, [location]);
  return (
    <>
      {/* {isIndex ? ( */}
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Loading...</h1>
            <p className="text-xl text-gray-600">Redirecting to your feed.</p>
          </div>
        </div>
      {/* ) : (
        <Outlet />
      )} */}
    </>
  );
};

export default Index;
