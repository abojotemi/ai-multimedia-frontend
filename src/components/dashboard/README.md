# Dashboard Components

This directory contains the modular components that make up the Dashboard page. The original monolithic Dashboard component has been split into smaller, more manageable components.

## Component Structure

- **StatsCards**: Displays the three stats cards at the top of the dashboard (Total Assets, Recently Added, Media Usage).
- **AIActionsBar**: Contains the three AI action buttons (Batch AI Tagging, Content Analysis, Natural Language Search).
- **AIActionPanel**: Shows the panel that appears when an AI action is selected, allowing users to enter prompts.
- **SearchAndFilters**: Contains the search input and tag filters for filtering media items.
- **MediaGallery**: Displays the media items in either grid or list view, with options to select, view, download, or delete items.
- **RecentActivities**: Shows the recent user activities in the system.
- **ContentAnalytics**: Displays analytics about the media content, including type distribution and AI-generated tags.

## Usage

All components are exported from the `index.js` file, so they can be imported like this:

```jsx
import { 
  StatsCards, 
  AIActionsBar, 
  AIActionPanel, 
  SearchAndFilters, 
  MediaGallery, 
  RecentActivities, 
  ContentAnalytics 
} from './dashboard';
```

## Props

Each component accepts specific props related to its functionality:

### StatsCards
- `stats`: Object containing dashboard statistics
- `isLoadingStats`: Boolean indicating if stats are loading

### AIActionsBar
- `aiActionMode`: String indicating the current AI action mode
- `setAiActionMode`: Function to update the AI action mode

### AIActionPanel
- `aiActionMode`: String indicating the current AI action mode
- `selectedItems`: Array of selected item IDs
- `aiPrompt`: String containing the current AI prompt
- `setAiPrompt`: Function to update the AI prompt
- `setAiActionMode`: Function to update the AI action mode
- `handleAiPromptSubmit`: Function to handle AI prompt submission

### SearchAndFilters
- `searchQuery`: String containing the current search query
- `setSearchQuery`: Function to update the search query
- `allTags`: Array of all available tags
- `selectedTags`: Array of currently selected tags
- `toggleTag`: Function to toggle a tag's selection
- `viewMode`: String indicating the current view mode (grid/list)
- `setViewMode`: Function to update the view mode

### MediaGallery
- `filteredMediaItems`: Array of media items to display
- `isLoadingMedia`: Boolean indicating if media items are loading
- `viewMode`: String indicating the current view mode (grid/list)
- `selectedItems`: Array of selected item IDs
- `setSelectedItems`: Function to update selected items
- `handleDeleteItem`: Function to handle item deletion

### RecentActivities
- `recentActivities`: Array of recent activity items
- `isLoadingActivities`: Boolean indicating if activities are loading

### ContentAnalytics
- `analytics`: Object containing analytics data
- `isLoadingAnalytics`: Boolean indicating if analytics are loading

## Benefits of This Structure

1. **Improved Maintainability**: Each component has a single responsibility, making it easier to understand and modify.
2. **Better Code Organization**: Related code is grouped together in separate files.
3. **Enhanced Reusability**: Components can be reused in other parts of the application.
4. **Easier Testing**: Smaller components are easier to test in isolation.
5. **Improved Performance**: Components can be optimized individually.
6. **Better Collaboration**: Different team members can work on different components simultaneously.