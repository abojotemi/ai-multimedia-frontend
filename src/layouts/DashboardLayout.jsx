import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar";  // Assuming you have a Sidebar
import Navbar from "../components/NavBar";    // Assuming you have a Navbar
import AIChatBubble from "../components/AIChatBubble";
import MediaPreviewModal from "../components/MediaPreviewModal";

export default function DashboardLayout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Provide this function through context or props to child components
  const openMediaPreview = (file) => {
    setPreviewFile(file);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onClose={() => setShowSidebar(false)} showSidebar={showSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4">
          <Outlet context={{ openMediaPreview }} />
        </main>
      </div>
      <AIChatBubble />
      
      {/* Render the preview modal when a file is selected */}
      {previewFile && (
        <MediaPreviewModal 
          file={previewFile} 
          onClose={() => setPreviewFile(null)} 
        />
      )}
    </div>
  );
} 