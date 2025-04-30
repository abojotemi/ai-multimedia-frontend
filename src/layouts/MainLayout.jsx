import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";

const MainLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  
  
  return (
    <div className="flex h-screen bg-dark p-0 sm:p-4 font-gilroy">
      <div className="flex w-full gap-0 sm:gap-4 bg-gray-100 rounded-none sm:rounded-2xl overflow-hidden">
        {/* Mobile sidebar overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-transparent z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar */}
        <SideBar
          onClose={() => setShowSidebar(false)}
          showSidebar={showSidebar}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <NavBar
            onMenuClick={() => setShowSidebar(true)}
          />
            <div className="flex-1 overflow-y-auto">


            </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
