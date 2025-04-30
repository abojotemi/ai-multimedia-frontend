import { ChevronDown, User } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { HiMenu } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { authService } from "../api/apiService";

const NavBar = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goToSettings = () => {
    navigate("/settings");
    setDropdownOpen(false);
  };

  return (
    <div className="px-4 py-6 flex items-center gap-4 justify-between">
      <div>
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-xl cursor-pointer"
          >
            <HiMenu />
          </button>
          <h1 className="text-lg font-semibold">AI Multimedia</h1>
        </div>
      </div>
      <div className="relative" ref={dropdownRef}>
        <div 
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="h-8 w-8 rounded-full bg-jasper flex items-center justify-center text-white">
            <User size={18} />
          </div>
          <div className="flex items-center gap-2 max-sm:hidden">
            <span>{user?.username || "User"}</span>
            <ChevronDown 
              size={16} 
              className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
            <button
              onClick={goToSettings}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
