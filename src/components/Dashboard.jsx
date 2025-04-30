import React, { useEffect, useState } from "react";
import dashboardStore from "../store/dashboardStore";
import {
  StatsCards,
  AIActionsBar,
  AIActionPanel,
  SearchAndFilters,
  MediaGallery,
  RecentActivities,
  ContentAnalytics,
  ProcessingCard
} from "./dashboard";

// Dashboard Component
export default function Dashboard() {
  const [aiActionMode, setAiActionMode] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [aiPrompt, setAiPrompt] = useState("");
  
  // Get state and actions from the dashboard store
  const {
    // Media items
    filteredMediaItems,
    isLoadingMedia,

    // Recent activities
    recentActivities,
    isLoadingActivities,

    // Dashboard stats
    stats,
    isLoadingStats,

    // Content analytics
    analytics,
    isLoadingAnalytics,

    // Search and filter state
    searchQuery,
    selectedTags,
    viewMode,

    // Error state
    error,

    // Actions
    setViewMode,
    setSearchQuery,
    toggleTag,
    fetchAllDashboardData,
    fetchMediaItems,
    deleteMediaItem,
  } = dashboardStore();

  // Fetch all dashboard data on component mount
  useEffect(() => {
    fetchAllDashboardData();
  }, [fetchAllDashboardData]);

  // Handle AI prompt submission
  const handleAiPromptSubmit = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    // Connect to AI backend through API service
    try {
      // This would be implemented in your API service
      // await aiService.processPrompt(aiActionMode, selectedItems, aiPrompt);
      
      // Reset the prompt after submission
      setAiPrompt("");
    } catch (error) {
      console.error("AI processing error:", error);
    }
  };

  // Handle media item deletion
  const handleDeleteItem = async (itemId) => {
    const result = await deleteMediaItem(itemId);
    if (!result.success) {
      // Handle error (could show a toast notification here)
      console.error(result.error);
    }
  };

  // Get all unique tags from media items
  const allTags = [
    ...new Set(filteredMediaItems.flatMap((item) => item.tags || [])),
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} isLoading={isLoadingStats} />
      
      {/* Processing Status Card */}
      <ProcessingCard />

      {/* AI Actions Bar */}
      {/* <AIActionsBar 
        onActionSelect={setAiActionMode} 
        selectedAction={aiActionMode}
        selectedItemsCount={selectedItems.length}
      /> */}

      {/* AI Action Panel (shown when an action is selected) */}
      {aiActionMode && (
        <AIActionPanel
          actionMode={aiActionMode}
          prompt={aiPrompt}
          setPrompt={setAiPrompt}
          onSubmit={handleAiPromptSubmit}
          onCancel={() => setAiActionMode(null)}
        />
      )}

      {/* Search and Filters */}
      <SearchAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTags={selectedTags}
        availableTags={allTags}
        toggleTag={toggleTag}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Media Gallery */}
      <MediaGallery
        filteredMediaItems={filteredMediaItems}
        isLoadingMedia={isLoadingMedia}
        viewMode={viewMode}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        handleDeleteItem={handleDeleteItem}
        onRefresh={fetchMediaItems}
      />

      {/* Bottom Row: Analytics and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <ContentAnalytics 
            analytics={analytics} 
            isLoading={isLoadingAnalytics} 
          />
        </div>
        {/* <div>
          <RecentActivities 
            activities={recentActivities} 
            isLoading={isLoadingActivities} 
          />
        </div> */}
      </div>
    </div>
  );
}