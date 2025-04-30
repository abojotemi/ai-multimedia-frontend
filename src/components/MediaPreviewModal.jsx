import { useState } from "react";
import { X, Download, Brain, FileText } from "lucide-react";

export default function MediaPreviewModal({ file, onClose }) {
  // Helper function to render file preview based on type
  const renderFilePreview = () => {
    const previewUrl = file.previewUrl;
    
    if (file.type === "image") {
      return <img src={previewUrl} alt={file.name} className="max-h-full max-w-full object-contain" />;
    } else if (file.type === "video") {
      return (
        <video controls className="max-h-full max-w-full">
          <source src={previewUrl} type={`video/${file.extension}`} />
          Your browser does not support video playback.
        </video>
      );
    } else if (file.type === "audio") {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="bg-jasper-100 p-6 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-jasper-600">
              <path d="M12 18a6 6 0 0 0 0-12v12z"></path>
              <path d="M19 12a7 7 0 0 0-13-4"></path>
              <path d="M5 16a7 7 0 0 0 13-4"></path>
            </svg>
          </div>
          <audio controls src={previewUrl} className="w-full max-w-md" />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center">
          <div className="bg-jasper-100 p-6 rounded-full mb-4">
            <FileText size={48} className="text-jasper-600" />
          </div>
          <p className="text-center text-lg font-medium">{file.name}</p>
          <p className="text-sm text-gray-500 mt-2">Document preview not available</p>
          <a href={previewUrl} download={file.name} className="mt-4 px-4 py-2 bg-jasper-500 text-white rounded-lg hover:bg-jasper-600 flex items-center gap-2">
            <Download size={16} />
            <span>Download to View</span>
          </a>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-jasper-50">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg">{file?.name}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Preview Area (70%) */}
          <div className="w-[70%] h-full flex justify-center items-center p-4 overflow-hidden bg-gray-50">
            {renderFilePreview()}
          </div>
          
          {/* AI Insights Panel (30%) */}
          <div className="w-[30%] border-l overflow-y-auto p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Brain size={18} className="text-jasper-500" />
              <h3 className="font-medium text-lg text-jasper-700">AI Insights</h3>
            </div>
            
            <div className="bg-jasper-50 p-4 rounded-lg">
              <p className="text-sm text-gray-800 whitespace-pre-line">
                {file.description || "No AI insights available for this file. Upload it for AI analysis to generate insights."}
              </p>
            </div>
            
            {file.metadata?.aiTags && file.metadata.aiTags.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm text-gray-600 mb-2">AI Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {file.metadata.aiTags.map((tag, index) => (
                    <span key={index} className="bg-jasper-100 text-jasper-700 px-2 py-1 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <a 
                href={file.previewUrl} 
                download={file.name} 
                className="w-full flex items-center justify-center gap-2 bg-jasper-500 text-white px-4 py-2 rounded-lg hover:bg-jasper-600 transition-colors"
              >
                <Download size={16} />
                <span>Download File</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 