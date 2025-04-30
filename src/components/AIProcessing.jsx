import { useState, useEffect } from "react";
import {
  Image,
  Video,
  Music,
  FileText,
  Search,
  Check,
  Brain,
  Zap,
  ChevronDown,
  Filter,
  Loader,
  AlertCircle,
  Eye,
  X,
  Download,
  ExternalLink,
  LayoutPanelLeft,
} from "lucide-react";
import { mediaService, aiService } from "../api/apiService";
import ProcessingResults from "./ProcessingResults";
import useAiStore from "../store/aiStore";
export default function AIProcessing() {
  // Add a key to force component remounting when we need to reset state
  const [componentKey, setComponentKey] = useState(Date.now());

  // State for media selection and filtering
  const [mediaType, setMediaType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for selected processing option - now a single string instead of an object
  const [selectedOption, setSelectedOption] = useState(null);

  // Use the aiStore for persisting processing state
  const {
    isProcessing,
    processingResults,
    error: processingError,
    processMedia,
    clearResults,
  } = useAiStore();

  // State to track if we should show results
  const [showResults, setShowResults] = useState(false);

  // State for preview functionality
  const [previewItem, setPreviewItem] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Processing options for each media type
  const mediaTypeOptions = {
    all: [
      {
        id: "recognition",
        title: "Object/Face Recognition",
        description: "Identify objects and people in images",
      },
      {
        id: "moderation",
        title: "Content Moderation",
        description: "Flag sensitive or inappropriate content",
      },
      {
        id: "ocr",
        title: "OCR Text Extraction",
        description: "Extract text from images",
      },
      {
        id: "tagging",
        title: "Auto-Tagging",
        description: "Generate descriptive tags for images",
      },
    ],
    image: [
      {
        id: "recognition",
        title: "Object/Face Recognition",
        description: "Identify objects and people in images",
      },
      {
        id: "moderation",
        title: "Content Moderation",
        description: "Flag sensitive or inappropriate content",
      },
      {
        id: "ocr",
        title: "OCR Text Extraction",
        description: "Extract text from images",
      },
      {
        id: "tagging",
        title: "Auto-Tagging",
        description: "Generate descriptive tags for images",
      },
    ],
    video: [
      {
        id: "recognition",
        title: "Object/Scene Recognition",
        description: "Identify objects and scenes in videos",
      },
      {
        id: "transcription",
        title: "Audio Transcription",
        description: "Convert speech to text in videos",
      },
      {
        id: "moderation",
        title: "Content Moderation",
        description: "Flag sensitive or inappropriate content",
      },
      {
        id: "summarization",
        title: "Video Summarization",
        description: "Generate summaries of video content",
      },
    ],
    audio: [
      {
        id: "transcription",
        title: "Audio Transcription",
        description: "Convert speech to text",
      },
      {
        id: "moderation",
        title: "Content Moderation",
        description: "Flag sensitive or inappropriate content",
      },
      {
        id: "emotion",
        title: "Emotion Analysis",
        description: "Detect emotions in speech",
      },
      {
        id: "speaker",
        title: "Speaker Identification",
        description: "Identify different speakers",
      },
    ],
    // document: [
    //   { id: "ocr", title: "OCR Processing", description: "Extract and index text from documents" },
    //   { id: "summarization", title: "Document Summarization", description: "Generate concise summaries" },
    //   { id: "classification", title: "Document Classification", description: "Classify document types and subjects" },
    //   { id: "entity", title: "Entity Extraction", description: "Extract names, dates, organizations, etc." },
    // ],
  };

  // Initialize when media type changes
  useEffect(() => {
    // Reset selected items and option when media type changes
    setSelectedItems([]);
    setSelectedOption(null);

    // Force a component remount to clear any stale state
    setComponentKey(Date.now());

    // Fetch media items of the selected type
    fetchMediaItems();
  }, [mediaType]);

  // Function to fetch media items from the backend
  const fetchMediaItems = async () => {
    setIsLoading(true);
    try {
      // Fetch media items (optionally filtered by type)
      const params = {};
      if (mediaType !== "all") {
        params.type = mediaType;
      }
      if (searchQuery) {
        params.query = searchQuery;
      }

      console.log("Fetching media items with params:", params);
      const response = await mediaService.getAllMedia(params);
      console.log("Fetched media items:", response);

      // If response is an array, use it directly
      if (Array.isArray(response)) {
        setMediaItems(response);
      }
      // Handle case where API returns an object with data property
      else if (response && response.data && Array.isArray(response.data)) {
        setMediaItems(response.data);
      }
      // If neither, set empty array
      else {
        console.error("Unexpected response format:", response);
        setMediaItems([]);
      }
    } catch (error) {
      console.error("Error fetching media items:", error);
      setMediaItems([]);
    } finally {
      console.log(`Media Items: ${mediaItems}`);
      setIsLoading(false);
    }
  };

  // Effect to fetch media when search query changes
  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchMediaItems();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Select a processing option (only one can be selected at a time)
  const selectOption = (optionId) => {
    setSelectedOption(optionId === selectedOption ? null : optionId);
  };

  // Toggle selection of a media item
  const toggleSelectItem = (itemId) => {
    // Always use string IDs for consistency
    const id = String(itemId);
    console.log(`Item Id: ${itemId}`);
    setSelectedItems((prev) => {
      // Create a new array with all string IDs for consistent comparison
      const prevStringIds = prev.map(String);

      // Check if the item is already selected
      const isAlreadySelected = prevStringIds.includes(id);

      if (isAlreadySelected) {
        // Remove the item if it's already selected
        return prevStringIds.filter((existingId) => existingId !== id);
      } else {
        // Add the item if it's not already selected
        return [...prevStringIds, id];
      }
    });
  };

  // Open preview for a media item
  const openPreview = (item, e) => {
    // Stop the click event from triggering the toggleSelectItem
    e.stopPropagation();
    setPreviewItem(item);
    setShowPreview(true);
  };

  // Close preview
  const closePreview = () => {
    setPreviewItem(null);
    setShowPreview(false);
  };

  // Start AI processing
  const startProcessing = async () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to process");
      return;
    }

    // Check if a processing option is selected
    if (!selectedOption) {
      alert("Please select a processing option");
      return;
    }

    // Create options object with only the selected option set to true
    const processingOptions = {};
    processingOptions[selectedOption] = true;

    // Ensure all IDs are strings before sending to the API
    const normalizedMediaIds = selectedItems.map((id) => String(id));

    // Use the store's processMedia function to trigger processing
    // and handle state updates
    await processMedia(normalizedMediaIds, processingOptions);

    // Show results view
    setShowResults(true);
  };

  // Handle going back from results to selection
  const handleBackToSelection = () => {
    setShowResults(false);
  };

  // Handle going to results view without clearing prior results
  const handleGoToResults = () => {
    setShowResults(true);
  };

  // Get icon for media type
  const getMediaTypeIcon = (type) => {
    switch (type) {
      case "all":
        return <Brain size={24} />;
      case "image":
        return <Image size={24} />;
      case "video":
        return <Video size={24} />;
      case "audio":
        return <Music size={24} />;
      // case "document":
      //   return <FileText size={24} />;
      default:
        return <FileText size={24} />;
    }
  };

  // Get media item display
  const getMediaItemDisplay = (item) => {
    const type = item.file_type || item.fileType;

    if (type === "image") {
      return (
        <img
          src={item.file_url || item.fileUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      );
    } else if (type === "video" && (item.thumbnail_url || item.thumbnailUrl)) {
      return (
        <div className="relative">
          <img
            src={item.thumbnail_url || item.thumbnailUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-full p-2">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full">
          {type === "audio" ? (
            <Music size={32} className="text-gray-400" />
          ) : type === "video" ? (
            <Video size={32} className="text-gray-400" />
          ) : (
            <FileText size={32} className="text-gray-400" />
          )}
        </div>
      );
    }
  };

  // Render the preview modal
  const renderPreviewModal = () => {
    if (!previewItem || !showPreview) return null;

    const type = previewItem.file_type || previewItem.fileType;
    const url = previewItem.file_url || previewItem.fileUrl;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">{previewItem.name}</h3>
            <button
              onClick={closePreview}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            {type === "image" ? (
              <img
                src={url}
                alt={previewItem.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : type === "video" ? (
              <video src={url} controls className="max-w-full max-h-[70vh]">
                Your browser does not support the video tag.
              </video>
            ) : type === "audio" ? (
              <div className="w-full">
                <audio src={url} controls className="w-full">
                  Your browser does not support the audio tag.
                </audio>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <FileText size={64} className="text-gray-400 mb-4" />
                <p className="mb-4">
                  This document type can't be previewed directly.
                </p>
                <div className="flex space-x-4">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-jasper-500 text-white rounded-md flex items-center"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Open in New Tab
                  </a>
                  <a
                    href={url}
                    download={previewItem.name}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md flex items-center"
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t flex justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {type?.charAt(0).toUpperCase() + type?.slice(1) ||
                  "Unknown Type"}
                {previewItem.size && ` • ${formatFileSize(previewItem.size)}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={closePreview}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
              >
                Close
              </button>
              <button
                onClick={(e) => {
                  closePreview();
                  const previewItemId = String(
                    previewItem._id || previewItem.id
                  );
                  if (!selectedItems.map(String).includes(previewItemId)) {
                    toggleSelectItem(previewItemId);
                  }
                }}
                className="px-4 py-2 bg-jasper-500 text-white rounded-md"
              >
                Select for Processing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  };

  // Initialize when component mounts to check if there are any results to show
  useEffect(() => {
    if (processingResults) {
      // Keep the results visible if they exist
      setShowResults(true);
    }
  }, []);

  return (
    <div key={componentKey} className="w-full max-w-6xl mx-auto p-6 rounded-lg">
      {/* Preview modal */}
      {renderPreviewModal()}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-jasper-500 flex items-center">
          <Brain className="mr-2" size={28} />
          AI Processing Center
        </h1>

        {/* Toggle buttons for selection and results views */}
        <div className="flex space-x-2">
          <button
            onClick={handleBackToSelection}
            className={`px-4 py-2 rounded-md flex items-center ${
              !showResults
                ? "bg-jasper-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            <LayoutPanelLeft size={16} className="mr-2" />
            Selection
          </button>

          <button
            onClick={handleGoToResults}
            disabled={!processingResults && !isProcessing}
            className={`px-4 py-2 rounded-md flex items-center ${
              showResults
                ? "bg-jasper-600 text-white"
                : processingResults || isProcessing
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Brain size={16} className="mr-2" />
            Results
            {isProcessing && <Loader size={14} className="ml-2 animate-spin" />}
          </button>
        </div>
      </div>

      {/* Toggle between selection view and results view */}
      {showResults ? (
        <ProcessingResults onBack={handleBackToSelection} />
      ) : (
        <>
          {/* Media Type Selection */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All Media" },
                { id: "image", label: "Images" },
                { id: "video", label: "Videos" },
                { id: "audio", label: "Audio" },
                // { id: "document", label: "Documents" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    mediaType != type.id ? setMediaType(type.id) : "";
                  }}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    mediaType === type.id
                      ? "bg-jasper-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {getMediaTypeIcon(type.id)}
                  <span className="ml-2">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mb-6 flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder={`Search media...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 p-2 border-2 border-gray-300 rounded-md"
              />
            </div>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md flex items-center">
              <Filter size={18} className="mr-1" />
              Filters
              <ChevronDown size={16} className="ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Media Gallery with Selection */}
            <div className="lg:col-span-2">
              <div className="bg-white border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    Select Media to Process ({mediaItems.length})
                  </h2>
                  <div className="text-sm text-jasper-600">
                    {selectedItems.length} selected
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin h-12 w-12 text-jasper-600" />
                  </div>
                ) : mediaItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <FileText size={48} className="mb-2" />
                    <p>
                      No media items found. Try a different search or upload
                      some media.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {mediaItems.map((item) => {
                      // Ensure we have a reliable and unique string ID
                      const itemId = String(item._id || item.id);
                      // Check if this specific item is selected using includes with string comparison
                      const isSelected = selectedItems
                        .map(String)
                        .includes(itemId);

                      return (
                        <div
                          key={itemId}
                          className={`relative cursor-pointer rounded-lg border-2 overflow-hidden ${
                            isSelected
                              ? "border-jasper-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleSelectItem(itemId);
                          }}
                        >
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            {getMediaItemDisplay(item)}
                          </div>
                          <div className="p-2">
                            <p className="text-sm truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.file_type ||
                                item.fileType ||
                                "Unknown type"}
                            </p>
                          </div>

                          {/* Preview button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPreview(item, e);
                            }}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1.5 rounded-full hover:bg-opacity-70"
                            title="Preview"
                          >
                            <Eye size={14} />
                          </button>

                          {isSelected && (
                            <div className="absolute top-2 left-2 bg-jasper-500 text-white p-1 rounded-full">
                              <Check size={14} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Processing Options Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-md p-4 sticky top-4">
                <h2 className="text-lg font-medium mb-4">Processing Options</h2>

                {/* Processing options based on media type */}
                <div className="space-y-3 mb-6">
                  {mediaTypeOptions[mediaType]?.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => selectOption(option.id)}
                      className={`p-3 border rounded-md cursor-pointer transition-all ${
                        selectedOption === option.id
                          ? "border-jasper-500 bg-jasper-50"
                          : "border-gray-200 hover:border-jasper-200"
                      }`}
                    >
                      <div className="font-medium flex items-center">
                        {selectedOption === option.id && (
                          <Check size={16} className="text-jasper-500 mr-1" />
                        )}
                        {option.title}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {option.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Process button */}
                <button
                  onClick={startProcessing}
                  disabled={
                    isLoading ||
                    isProcessing ||
                    selectedItems.length === 0 ||
                    !selectedOption
                  }
                  className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                    isLoading ||
                    isProcessing ||
                    selectedItems.length === 0 ||
                    !selectedOption
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-jasper-500 text-white hover:bg-jasper-600"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2" size={16} />
                      Process Selected Items
                    </>
                  )}
                </button>

                {/* Error message */}
                {processingError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                    <AlertCircle
                      className="mt-0.5 mr-2 flex-shrink-0"
                      size={16}
                    />
                    <div className="text-sm">{processingError}</div>
                  </div>
                )}

                {/* Processing results status */}
                {processingResults && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
                    <h3 className="font-medium flex items-center">
                      <Check className="mr-2" size={16} />
                      Processing Complete
                    </h3>
                    <p className="text-sm mt-1">
                      Successfully processed media.
                    </p>
                    <button
                      onClick={handleGoToResults}
                      className="mt-2 px-3 py-1 bg-green-600 text-white rounded-md text-sm flex items-center"
                    >
                      <Brain size={14} className="mr-1" />
                      View Results
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
