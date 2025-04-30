import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { MdCloudUpload } from "react-icons/md";
import { MdCollectionsBookmark } from "react-icons/md";
import { FaQuestionCircle } from "react-icons/fa";
import { FaBrain } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { FaGear } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { MdNavigateBefore, MdNavigateNext, MdLogout } from "react-icons/md";
import { authService } from "../api/apiService";

const SideBar = ({ onClose, showSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.slice(1) || "chat";
  const [showSideLg, setShowSideLg] = useState(true);

  const menuItems = [
    { icon: MdDashboard, label: "Dashboard", id: "dashboard" },
    { icon: MdCloudUpload, label: "Upload", id: "upload" },
    { icon: FaBrain, label: "AI Processing", id: "ai-processing" },
    // { icon: FaSearch, label: "Search", id: "search" }, 
    // { icon: MdCollectionsBookmark, label: "Collection", id: "collection" },
    { icon: FaGear, label: "Settings", id: "settings" },
    // { icon: FaQuestionCircle, label: "Updates & FAQ", id: "faq" },
  ];

  const handleNavigation = (path) => {
    navigate(`/${path}`);
    onClose();
  };
  const handleLogOut = async () => {
    try {
      await authService.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div
      className={`
      fixed lg:static w-64 h-full z-50 transition-all duration-300 bg-sidebar-bg 
      ${
        showSidebar ? "translate-x-0" : "-translate-x-[120%] lg:translate-x-0 "
      } ${showSideLg ? "" : "lg:w-20"}
    `}
    >
      <div className="flex flex-col h-full text-white">
        {/* Logo section */}
        <div
          className={`flex items-center justify-between gap-2 p-4 ${
            !showSideLg && "lg:justify-center"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${!showSideLg && "lg:hidden"}`}>
              AI Multimedia{" "}
            </span>
          </div>
          <div
            className="max-lg:hidden cursor-pointer relative bg-jasper p-1 rounded-lg group"
            onClick={() => setShowSideLg((side) => !side)}
          >
            {showSideLg ? (
              <MdNavigateBefore className="size-6 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <MdNavigateNext className="size-6 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-white/10 rounded-lg lg:hidden cursor-pointer"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* Menu items */}
        <nav className="flex-1 px-2 py-4 space-y-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-7 rounded-lg mb-2 cursor-pointer m-auto
              ${currentPage === item.id ? "bg-white/10" : "hover:bg-white/5"} ${
                !showSideLg && "lg:justify-center"
              } relative group`}
            >
              <item.icon
                className={`text-xl ${
                  currentPage === item.id ? "text-jasper" : ""
                } ${!showSideLg && "lg:size-7"}`}
              />

              <span
                className={`flex-1 tracking-widest text-left ${
                  !showSideLg && "lg:hidden"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`${
                  showSideLg
                    ? "hidden"
                    : "max-lg:hidden absolute left-[120%] bg-sidebar-bg/95 px-3 py-1 rounded-lg invisible group-hover:visible w-auto -translate-x-5 group-hover:translate-x-0 transition-transform"
                }`}
              >
                {item.label}
              </span>
              {item.pro && (
                <span className="text-xs  px-1.5 py-0.5 bg-jasper rounded">
                  PRO
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-white/10 " onClick={handleLogOut}>
          <button
            className={`flex items-center gap-2 text-white/80 hover:text-white ${
              !showSideLg && "lg:justify-center w-full"
            } group cursor-pointer`}
          >
            <span className={`${!showSideLg && "lg:hidden"}`}>Log out</span>
            <span
              className={`text-xl ${
                !showSideLg && "lg:text-3xl font-extrabold"
              }`}
            >
              <MdLogout />
            </span>
            <span
              className={`${
                showSideLg
                  ? "hidden"
                  : "max-lg:hidden absolute left-[120%] bg-sidebar-bg/95 px-3 py-1 rounded-lg invisible group-hover:visible w-auto -translate-x-5 group-hover:translate-x-0 transition-transform"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideBar;


