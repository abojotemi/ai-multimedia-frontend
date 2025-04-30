import { useState, useEffect } from "react";
import {
  Check,
  Copy,
  RefreshCw,
  ChevronDown,
  Image,
  Video,
  Music,
  FileText,
  Brain
} from "lucide-react";
import { aiService } from "../api/apiService";
import useAiStore from "../store/aiStore";
import { mediaService } from "../api/apiService";

export default function ProcessingResults({ onBack }) {
  const [expandedMedia, setExpandedMedia] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  
  // Get data from AI store
  const { 
    processingResults, 
    currentJob, 
    processingJobs,
    isProcessing, 
    pollJobStatus
  } = useAiStore();
  
  // Function to toggle expanded state of a media item
  const toggleExpand = (mediaId) => {
    setExpandedMedia(prev => 
      prev.includes(mediaId)
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };
  
  // Function to check if media is expanded
  const isExpanded = (mediaId) => expandedMedia.includes(mediaId);
  
  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert("Text copied to clipboard");
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  // Fetch media items if not already passed
  useEffect(() => {
    const fetchMedia = async () => {
      setIsLoadingMedia(true);
      try {
        const response = await mediaService.getAllMedia();
        const items = Array.isArray(response) ? response : (response?.data || []);
        setMediaItems(items);
      } catch (error) {
        console.error("Error fetching media items:", error);
      } finally {
        setIsLoadingMedia(false);
      }
    };
    
    fetchMedia();
  }, []);
  
  // Find media item by ID
  const getMediaItem = (mediaId) => {
    return mediaItems.find(item => String(item._id || item.id) === String(mediaId));
  };
  
  // Check if a job is still in progress
  const isJobInProgress = () => {
    return isProcessing || (currentJob && (currentJob.status === "processing" || currentJob.status === "queued"));
  };
  
  // Poll for status updates if job is still processing
  useEffect(() => {
    if (currentJob && currentJob.jobId && isJobInProgress()) {
      // Continue polling for current job
      const interval = setInterval(() => {
        pollJobStatus(currentJob.jobId);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [currentJob, isProcessing]);
  
  if (!processingResults && !isProcessing && (!currentJob || currentJob.status === "failed")) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No processing results available</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-jasper-500 text-white rounded-md"
        >
          Back to Selection
        </button>
      </div>
    );
  }
  
  // Render a media result
  const renderMediaResult = (mediaId, mediaResults) => {
    const media = getMediaItem(mediaId);
    if (!media) return null;
    
    return (
      <div 
        key={mediaId} 
        className="border rounded-lg overflow-hidden bg-white shadow-sm mb-4"
      >
        <div 
          className="flex items-center p-4 cursor-pointer"
          onClick={() => toggleExpand(mediaId)}
        >
          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden mr-3 flex-shrink-0">
            {media.file_type === "image" ? (
              <img src={media.file_url} alt={media.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {media.file_type === "video" ? (
                  <Video size={24} className="text-gray-500" />
                ) : media.file_type === "audio" ? (
                  <Music size={24} className="text-gray-500" />
                ) : (
                  <FileText size={24} className="text-gray-500" />
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-medium">{media.name}</h3>
            <p className="text-sm text-gray-500">{media.file_type}</p>
          </div>
          
          <ChevronDown 
            size={20} 
            className={`transition-transform ${isExpanded(mediaId) ? 'rotate-180' : ''}`}
          />
        </div>
        
        {isExpanded(mediaId) && (
          <div className="p-4 border-t">
            {mediaResults.error ? (
              <div className="p-3 bg-red-50 text-red-700 rounded-md">
                <p className="font-medium">Error</p>
                <p className="text-sm">{mediaResults.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(mediaResults).map(([option, result]) => (
                  <div key={option} className="border rounded-md p-3">
                    <h4 className="font-medium mb-2 capitalize">
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    
                    {result.text && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-500">Text</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(result.text);
                            }}
                            className="text-jasper-500 hover:text-jasper-600"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md text-sm max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {result.text}
                        </div>
                      </div>
                    )}
                    
                    {result.tags && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500 block mb-1">Tags</span>
                        <div className="flex flex-wrap gap-2">
                          {result.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-jasper-100 text-jasper-800 text-xs rounded-md"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {result.description && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-500">Description</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(result.description);
                            }}
                            className="text-jasper-500 hover:text-jasper-600"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md text-sm">
                          {result.description}
                        </div>
                      </div>
                    )}
                    
                    {result.confidence && (
                      <div className="text-sm text-gray-500">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="mt-4">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md flex items-center"
      >
        <ChevronDown className="rotate-90 mr-2" size={16} />
        Back to Selection
      </button>
      
      <div className="bg-white border rounded-lg p-5">
        <h2 className="text-xl font-semibold mb-4 text-jasper-600 flex items-center">
          <Brain className="mr-2" size={24} />
          Processing Results
          {isJobInProgress() && (
            <div className="flex items-center text-jasper-500 ml-3">
              <RefreshCw size={16} className="mr-2 animate-spin" />
              Processing...
            </div>
          )}
        </h2>
        
        {/* Show processing status */}
        {isJobInProgress() ? (
          <div className="bg-blue-50 p-4 rounded-md mb-4">
            <p className="text-blue-700">
              Your media is being processed. Results will appear here when complete.
            </p>
          </div>
        ) : null}
        
        {/* Results list */}
        <div className="space-y-4">
          {processingResults && Object.entries(processingResults).map(([mediaId, mediaResults]) => 
            renderMediaResult(mediaId, mediaResults)
          )}
          
          {(!processingResults || Object.keys(processingResults).length === 0) && !isJobInProgress() && (
            <div className="bg-gray-50 p-4 rounded-md text-center">
              <p className="text-gray-500">No results available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 