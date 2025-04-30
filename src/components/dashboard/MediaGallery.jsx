import React, { useState } from "react";
import { 
  Upload, 
  File, 
  MoreHorizontal, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Brain, 
  RefreshCw 
} from "lucide-react";
import MediaPreviewModal from "../MediaPreviewModal";
import ConfirmationModal from "../ConfirmationModal";

const MediaGallery = ({ 
  filteredMediaItems, 
  isLoadingMedia, 
  viewMode, 
  selectedItems, 
  setSelectedItems, 
  handleDeleteItem, 
  onRefresh 
}) => {
  // Debugging to check for media items
  const [previewItem, setPreviewItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Helper function to get a consistent ID value from an item
  const getItemId = (item) => {
    // First try standard ID formats
    const id = item.id || item._id;
    
    // If we have an ID in either format, return it
    if (id) return id;
    
    // Fallback to another unique property if available
    return item.file_url || item.fileUrl || JSON.stringify(item);
  };
  
  // Log all item IDs for debugging
  console.log('Media items with IDs:', filteredMediaItems.map(item => ({
    id: item.id,
    _id: item._id,
    usedId: getItemId(item)
  })));
  
  // Handle view button click
  const handleViewItem = (item) => {
    // Convert the media item to the format expected by MediaPreviewModal
    const previewFile = {
      name: item.name,
      type: item.file_type || item.fileType,
      previewUrl: item.file_url || item.fileUrl,
      extension: item.file_type || item.fileType,
      description: item.description || "No AI description available for this file.",
      metadata: {
        aiTags: item.tags || []
      }
    };
    setPreviewItem(previewFile);
  };
  
  // Handle delete request - show confirmation modal
  const handleDeleteRequest = (itemId, e) => {
    if (e) e.stopPropagation();
    setItemToDelete(itemId);
    setShowDeleteModal(true);
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    if (itemToDelete) {
      handleDeleteItem(itemToDelete);
      setItemToDelete(null);
    }
  };
  
  // Handle download button click
  const handleDownloadItem = (item) => {
    const fileUrl = item.file_url || item.fileUrl;
    if (!fileUrl) {
      console.error('No file URL available for download');
      return;
    }
    
    // Create an anchor element and set its attributes for download
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = item.name || 'download'; // Use the file name or a default name
    anchor.target = '_blank';
    
    // Append to the document, click it, and then remove it
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Media Library</h2>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onRefresh} 
            disabled={isLoadingMedia}
            className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isLoadingMedia ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoadingMedia ? (
        <div className="text-center py-8">Loading media items...</div>
      ) : filteredMediaItems.length === 0 ? (
        <div className="text-center py-8">No media items found</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMediaItems.map((item) => (
            <div
              key={getItemId(item)}
              className={`rounded-lg overflow-hidden shadow bg-white ${selectedItems.includes(getItemId(item)) ? 'ring-2 ring-jasper-500' : ''}`}
            >
              <div className="relative">
                <div className="absolute top-2 left-2 z-10">
                  <input 
                    type="checkbox"
                    className="h-5 w-5 rounded text-jasper-500 focus:ring-jasper-500"
                    checked={selectedItems.includes(getItemId(item))}
                    onChange={() => {
                      setSelectedItems(prev => 
                        prev.includes(getItemId(item)) 
                          ? prev.filter(id => id !== getItemId(item))
                          : [...prev, getItemId(item)]
                      );
                    }}
                  />
                </div>
                {(item.thumbnailUrl || item.thumbnail_url) && (item.fileType !== "image" && item.file_type !== "image") ? (
                  <img
                    src={item.thumbnailUrl || item.thumbnail_url}
                    className="w-full h-40 object-cover"
                    alt={item.name}
                  />
                ) : null}
                {item.fileType === "image" || item.file_type === "image" ? (
                <img
                  src={item.fileUrl || item.file_url}
                  className="w-full h-40 object-cover"
                  alt={item.name}
                />
                ) : null}

                {!item.thumbnailUrl && !item.thumbnail_url && (item.fileType !== "image" && item.file_type !== "image") ? (
                  <div className="w-full h-40 bg-gray-200"></div>
                ) : null}
                {item.file_type === "video" || item.fileType === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-2">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                ) : null}
                {item.file_type === "audio" || item.fileType === "audio" ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-3">
                      <div className="w-6 h-4 flex items-center justify-around">
                        <div className="w-1 h-2 bg-white rounded"></div>
                        <div className="w-1 h-4 bg-white rounded"></div>
                        <div className="w-1 h-3 bg-white rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : null}
                {(item.file_type === "document" || item.fileType === "file") ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-4 flex items-center justify-around">
                      <File size={72} className="text-gray-600" />
                    </div>
                  </div>
                ) : null}
                
                {/* AI Badge - show if content has AI processing */}
                {item.aiProcessed && (
                  <div className="absolute top-2 right-2 bg-jasper-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Brain size={12} className="mr-1" />
                    AI
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium mb-1 truncate">{item.name}</h3>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {item.upload_date || item.uploadDate 
                      ? new Date(item.upload_date || item.uploadDate).toLocaleDateString() 
                      : ""}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="p-1 hover:text-jasper"
                      onClick={() => handleViewItem(item)}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="p-1 hover:text-jasper"
                      onClick={() => handleDownloadItem(item)}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      className="p-1 hover:text-red-500"
                      onClick={(e) => handleDeleteRequest(getItemId(item), e)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="py-3.5 px-4 w-10">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded text-jasper-500 focus:ring-jasper-500"
                    checked={selectedItems.length > 0 && selectedItems.length === filteredMediaItems.length}
                    onChange={() => {
                      if (selectedItems.length === filteredMediaItems.length) {
                        setSelectedItems([]);
                      } else {
                        setSelectedItems(filteredMediaItems.map(item => getItemId(item)));
                      }
                    }}
                  />
                </th>
                <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Name
                </th>
                <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Type
                </th>
                <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Date Uploaded
                </th>
                <th scope="col" className="py-3.5 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Size
                </th>
                <th scope="col" className="py-3.5 px-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMediaItems.map((item) => (
                <tr
                  key={getItemId(item)}
                  className="hover:bg-gray-50 dark:hover:bg-jasper-50"
                >
                  <td className="py-3 px-4 w-10">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 rounded text-jasper-500 focus:ring-jasper-500"
                      checked={selectedItems.includes(getItemId(item))}
                      onChange={() => setSelectedItems(prev => 
                        prev.includes(getItemId(item)) 
                          ? prev.filter(id => id !== getItemId(item)) 
                          : [...prev, getItemId(item)]
                      )}
                    />
                  </td>
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded overflow-hidden">
                      {item.fileType === "image" || item.file_type === "image" ? (
                        <img
                          src={item.file_url || item.fileUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : item.thumbnail_url || item.thumbnailUrl ? (
                        <img
                          src={item.thumbnail_url || item.thumbnailUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <File size={16} className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <span>{item.name}</span>
                  </td>
                  <td className="py-3 px-4 capitalize">{item.file_type || item.fileType}</td>
                  <td className="py-3 px-4">
                    {item.upload_date || item.uploadDate 
                      ? new Date(item.upload_date || item.uploadDate).toLocaleDateString() 
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    {item.size || item.file_size 
                      ? `${((item.size || item.file_size) / 1024 / 1024).toFixed(2)} MB`
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="p-1 hover:text-jasper"
                        onClick={() => handleViewItem(item)}
                      >
                        <Eye size={16} />
                      </button>

                      <button 
                        className="p-1 hover:text-jasper"
                        onClick={() => handleDownloadItem(item)}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="p-1 hover:text-red-500"
                        onClick={(e) => handleDeleteRequest(getItemId(item), e)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Media Preview Modal */}
      {previewItem && (
        <MediaPreviewModal
          file={previewItem}
          onClose={() => setPreviewItem(null)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          confirmDelete();
          setShowDeleteModal(false);
        }}
        title="Delete Media Item"
        message="Are you sure you want to delete this media item? This action cannot be undone."
        confirmButtonText="Delete"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default MediaGallery;









