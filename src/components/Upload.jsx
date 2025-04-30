import { useState, useRef, useEffect } from "react";
import {
  Upload as UploadIcon,
  FileText,
  Image,
  Video,
  Music,
  X,
  Plus,
  Check,
  Edit,
  Clock,
  Eye,
  FileSearch,
  Brain,
  Zap,
  AlertCircle,
} from "lucide-react";
import { mediaService } from "../api/apiService";

export default function MultimediaUploadPage() {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [processingOptions, setProcessingOptions] = useState({ ocr: false, transcription: false });

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processNewFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processNewFiles(selectedFiles);
  };

  const handleFolderSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processNewFiles(selectedFiles);
  };

  const processNewFiles = (newFiles) => {
    // Define allowed extensions based on the types we support
    const allowedExtensions = [
      // Images
      "jpg", "jpeg", "png", "gif", "webp", "svg",
      // Videos
      "mp4", "mov", "avi", "webm", "mkv",
      // Audio
      "mp3", "wav", "ogg", "flac",
      // Documents
      "pdf", "doc", "docx", "txt", "rtf", "ppt", "pptx", "xls", "xlsx"
    ];
    
    // Filter files to only include allowed extensions and sizes under 50MB
    const validFiles = newFiles.filter(file => {
      const extension = file.name.split(".").pop().toLowerCase();
      const isValidExtension = allowedExtensions.includes(extension);
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB in bytes
      
      if (!isValidExtension) {
        alert(`File "${file.name}" has an unsupported file type. Only ${allowedExtensions.join(', ')} are supported.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`File "${file.name}" exceeds the 50MB size limit.`);
        return false;
      }
      
      return true;
    });

    const filesWithMetadata = validFiles.map((file) => {
      // Generate a unique ID for tracking
      const fileId = `file-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Get file extension
      const extension = file.name.split(".").pop().toLowerCase();

      // Determine file type
      let fileType = "document";
      if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension)) {
        fileType = "image";
      } else if (["mp4", "mov", "avi", "webm", "mkv"].includes(extension)) {
        fileType = "video";
      } else if (["mp3", "wav", "ogg", "flac"].includes(extension)) {
        fileType = "audio";
      } 
      // else if (
      //   [
      //     "pdf"
      //   ].includes(extension)
      // ) {
      //   fileType = "document";
      // }

      // Create preview URL for supported types
      const previewUrl = URL.createObjectURL(file);

      // Simulate AI-generated tags
      const aiTags = generateAITags(file.name, fileType);

      return {
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        type: fileType,
        extension,
        previewUrl,
        uploadProgress: 0,
        metadata: {
          dateCreated: new Date().toISOString(),
          aiTags,
          customFields: {},
        },
        aiProcessed: false,
      };
    });

    setFiles((prev) => [...prev, ...filesWithMetadata]);
    simulateUploads(filesWithMetadata);
  };

  const simulateUploads = (filesToUpload) => {
    filesToUpload.forEach((fileObj) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Simulate AI processing after upload
          setTimeout(() => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id ? { ...f, aiProcessed: true } : f
              )
            );
          }, 1500);
        }

        setUploadProgress((prev) => ({ ...prev, [fileObj.id]: progress }));
      }, 300);
    });
  };

  const generateAITags = (fileName, fileType) => {
    // This would normally be done by the backend AI
    const commonTags = ["project", "media"];
    
    const typeTags = {
      image: ["visual", "photo", "picture"],
      video: ["footage", "clip", "recording"],
      audio: ["sound", "audio", "recording"],
      document: ["document", "text", "information"],
    };
    
    // Extract potential keywords from filename
    const fileNameWords = fileName
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-zA-Z0-9]/g, " ") // Replace non-alphanumeric with spaces
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 3); // Only include words with more than 3 chars
    
    return [...commonTags, ...typeTags[fileType], ...fileNameWords.slice(0, 2)];
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));

    // Close preview if the removed file was being previewed
    if (previewFile && previewFile.id === id) {
      closePreview();
    }
  };

  const handleUrlUpload = () => {
    if (!urlInput.trim()) return;

    // This would need to be enhanced to actually fetch the file from the URL
    const fileName = urlInput.split("/").pop();
    const fakeFile = new File([""], fileName, {
      type: "application/octet-stream",
    });

    processNewFiles([fakeFile]);
    setUrlInput("");
  };

  const handleUploadSubmit = async () => {
    setIsProcessing(true);
    
    try {
      // Create FormData to send files
      const formData = new FormData();
      
      // Add each file to the form data
      files.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });
      
      // Send request to backend using the mediaService
      const response = await mediaService.uploadMedia(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload Progress: ${percentCompleted}%`);
      });
      
      setFiles([]);
      // Modified alert message - no mention of AI processing
      alert('Upload complete! Files have been uploaded successfully.');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsProcessing(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "image":
        return <Image className="text-jasper" />;
      case "video":
        return <Video className="text-purple-500" />;
      case "audio":
        return <Music className="text-green-500" />;
      default:
        return <FileText className="text-gray-500" />;
    }
  };

  const openPreview = (fileObj) => {
    // Close any existing preview before opening the new one
    if (previewOpen) {
      closePreview();
      // Use setTimeout to ensure the old preview is closed before opening the new one
      setTimeout(() => {
        setPreviewFile(fileObj);
        setPreviewOpen(true);
      }, 50);
    } else {
      setPreviewFile(fileObj);
      setPreviewOpen(true);
    }
  };

  const closePreview = () => {
    setPreviewOpen(false);
    // Don't immediately clear the previewFile to prevent layout shifts
    // Instead, wait until the closing animation completes
    setTimeout(() => setPreviewFile(null), 200);
  };

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach((fileObj) => {
        if (fileObj.previewUrl) {
          URL.revokeObjectURL(fileObj.previewUrl);
        }
      });
    };
  }, [files]);

  const renderPreview = () => {
    if (!previewFile) return null;

    switch (previewFile.type) {
      case "image":
        return (
          <img
            src={previewFile.previewUrl}
            alt={previewFile.name}
            className="max-w-full max-h-full object-contain"
          />
        );
      case "video":
        return (
          <video
            src={previewFile.previewUrl}
            controls
            className="max-w-full max-h-full"
          >
            Your browser does not support video playback.
          </video>
        );
      case "audio":
        return (
          <div className="p-8 flex flex-col items-center">
            <Music size={64} className="text-jasper mb-4" />
            <audio src={previewFile.previewUrl} controls className="w-full">
              Your browser does not support audio playback.
            </audio>
          </div>
        );
      case "document":
        // For PDF files, we can use the browser's built-in PDF viewer
        if (previewFile.extension === "pdf") {
          return (
            <iframe
              src={previewFile.previewUrl}
              className="w-full h-full min-h-96"
              title={previewFile.name}
            >
              Your browser does not support PDF preview.
            </iframe>
          );
        }
        // For text-based files we could use a text preview
        else if (["txt", "md", "rtf"].includes(previewFile.extension)) {
          return (
            <div className="p-4 bg-gray-50 rounded-md max-h-96 overflow-auto w-full">
              <p className="text-sm text-gray-700">
                Text preview will be shown here for {previewFile.name}.<br />
                In a full implementation, we would load and display the text
                content.
              </p>
            </div>
          );
        }
        // For other document types (Word, Excel, etc.) we display a placeholder
        return (
          <div className="p-8 flex flex-col items-center text-center">
            <FileSearch size={64} className="text-jasper mb-4" />
            <h3 className="text-lg font-medium mb-2">{previewFile.name}</h3>
            <p className="text-gray-500 mb-4">
              Preview not available for {previewFile.extension.toUpperCase()}{" "}
              files.
            </p>
            <p className={`text-sm text-gray-500 ${processingOptions.ocr && "text-jasper-400"}`}>
              In a full implementation, document preview could be enabled
              through conversion services or embedded viewers.
            </p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center">
            <FileText size={64} className="text-gray-400 mb-4" />
            <p>Preview not available</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6  rounded-lg ">
      <h1 className="text-2xl font-bold mb-6 text-jasper-500">Upload Media Files</h1>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
          dragging ? "border-jasper bg-jasper-50" : "border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleFileDrop}
      >
        <UploadIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl mb-2">Drag and drop files here</h2>
        <p className="text-gray-500 mb-4">
          Supports images, videos and audio
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="px-4 py-2 bg-jasper-600 text-white rounded-md hover:bg-jasper-700 flex items-center gap-2"
            onClick={() => fileInputRef.current.click()}
          >
            <Plus size={18} />
            Select Files
          </button>

          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center gap-2"
            onClick={() => folderInputRef.current.click()}
          >
            <Plus size={18} />
            Upload Folder
          </button>
        </div>

        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />

        <input
          type="file"
          webkitdirectory="true"
          directory="true"
          ref={folderInputRef}
          className="hidden"
          onChange={handleFolderSelect}
        />
      </div>

      {/* URL Input */}
      {/* <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Or upload from URL</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/file.jpg"
            className="flex-1 p-2 border-2 border-gray-300 rounded-md"
          />
          <button
            className="px-4 py-2 bg-jasper-600 text-white rounded-md hover:bg-jasper-700"
            onClick={handleUrlUpload}
          >
            Add
          </button>
        </div>
      </div> */}

      {/* File Preview List */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">
            Files to Upload ({files.length})
          </h3>
          <div className="border rounded-md divide-y">
            {files.map((fileObj) => (
              <div key={fileObj.id} className="p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  {fileObj.type === "image" ? (
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <img
                        src={fileObj.previewUrl}
                        alt={fileObj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                      {getFileIcon(fileObj.type)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium truncate">{fileObj.name}</p>
                      <p className={`text-sm text-gray-500`}>
                        {Math.round(fileObj.size / 1024)} KB • {fileObj.type}
                        {fileObj.type === "document" && processingOptions.ocr && 
                          <span className="text-jasper-500 ml-1">• OCR Ready</span>
                        }
                        {fileObj.type === "audio" && processingOptions.transcription && 
                          <span className="text-jasper-500 ml-1">• Transcription Ready</span>
                        }
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="text-jasper mr-3 hover:text-jasper-700"
                        onClick={() => openPreview(fileObj)}
                        title="Preview file"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-500"
                        onClick={() => removeFile(fileObj.id)}
                        title="Remove file"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2">
                    {uploadProgress[fileObj.id] < 100 ? (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-jasper h-2 rounded-full"
                          style={{ width: `${uploadProgress[fileObj.id]}%` }}
                        ></div>
                      </div>
                    ) : !fileObj.aiProcessed ? (
                      <div className="flex items-center text-sm text-jasper">
                        <Zap size={14} className="mr-1" />
                        AI processing queue ready
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {fileObj.metadata.aiTags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-jasper-100 text-jasper-800 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        <button className="text-xs text-jasper-600 flex items-center">
                          <Edit size={12} className="mr-1" />
                          Edit tags
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <button
            className={`px-6 py-3 rounded-md flex items-center gap-2 ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-jasper-600 hover:bg-jasper-700"
            } text-white font-medium`}
            onClick={handleUploadSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <UploadIcon size={18} />
                Upload {files.length} File{files.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}

      {/* File Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black backdrop-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium text-lg truncate">
                {previewFile?.name}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closePreview}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-64">
              {renderPreview()}
            </div>

            <div className="p-4 border-t flex justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {previewFile?.type.charAt(0).toUpperCase() +
                    previewFile?.type.slice(1)}{" "}
                  •{Math.round(previewFile?.size / 1024)} KB
                </p>
              </div>
              <button
                className="px-4 py-2 bg-jasper-600 text-white rounded-md"
                onClick={closePreview}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



