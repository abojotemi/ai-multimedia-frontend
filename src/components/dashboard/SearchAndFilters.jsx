import React, { useState, useEffect } from "react";
import { Search, Filter, LayoutGrid, List, ChevronDown, ChevronUp } from "lucide-react";

export default function SearchAndFilters({
  searchQuery,
  setSearchQuery,
  selectedTags,
  availableTags,
  toggleTag,
  viewMode,
  setViewMode
}) {
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [tagsToShow, setTagsToShow] = useState([]);
  
  // Define the number of tags to show when collapsed
  const MAX_VISIBLE_TAGS = 8;
  
  // Update tags to show based on expanded state
  useEffect(() => {
    if (isTagsExpanded || availableTags.length <= MAX_VISIBLE_TAGS) {
      setTagsToShow(availableTags);
    } else {
      setTagsToShow(availableTags.slice(0, MAX_VISIBLE_TAGS));
    }
  }, [availableTags, isTagsExpanded]);
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {/* Search and view toggles row */}
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 mb-4">
        {/* Search bar */}
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jasper-500"
          />
        </div>
        
        {/* View mode toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 mr-2">View:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md ${
              viewMode === 'grid' 
                ? 'bg-jasper-100 text-jasper-600' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md ${
              viewMode === 'list' 
                ? 'bg-jasper-100 text-jasper-600' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <List size={20} />
          </button>
        </div>
      </div>
      
      {/* Tags filter */}
      {availableTags && availableTags.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Filter size={16} className="mr-2 text-gray-500" />
              <div className="text-sm font-medium text-gray-600">Filter by tags</div>
            </div>
            {availableTags.length > MAX_VISIBLE_TAGS && (
              <button 
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className="text-sm text-jasper-600 flex items-center hover:underline"
              >
                {isTagsExpanded ? (
                  <>
                    <span>Show less</span>
                    <ChevronUp size={16} className="ml-1" />
                  </>
                ) : (
                  <>
                    <span>Show all ({availableTags.length})</span>
                    <ChevronDown size={16} className="ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {tagsToShow.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-jasper-100 text-jasper-700 border border-jasper-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}