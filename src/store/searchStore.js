import { create } from 'zustand'
import { searchService, mediaService } from '../api/apiService'

const useSearchStore = create((set, get) => ({
  // Search state
  query: '',
  results: [],
  filters: {
    mediaTypes: [],
    dateRange: {
      start: null,
      end: null
    },
    tags: [],
    aiProcessed: null // true, false, or null (any)
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0
  },
  sortBy: 'dateCreated',
  sortOrder: 'desc',
  isLoading: false,
  error: null,
  
  // Set search query
  setQuery: (query) => set({ query }),
  
  // Set filter
  setFilter: (filterName, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [filterName]: value
      }
    }));
  },
  
  // Toggle media type filter
  toggleMediaType: (mediaType) => {
    set(state => {
      const mediaTypes = state.filters.mediaTypes.includes(mediaType)
        ? state.filters.mediaTypes.filter(type => type !== mediaType)
        : [...state.filters.mediaTypes, mediaType];
      
      return {
        filters: {
          ...state.filters,
          mediaTypes
        }
      };
    });
  },
  
  // Set date range
  setDateRange: (start, end) => {
    set(state => ({
      filters: {
        ...state.filters,
        dateRange: { start, end }
      }
    }));
  },
  
  // Toggle tag filter
  toggleTag: (tag) => {
    set(state => {
      const tags = state.filters.tags.includes(tag)
        ? state.filters.tags.filter(t => t !== tag)
        : [...state.filters.tags, tag];
      
      return {
        filters: {
          ...state.filters,
          tags
        }
      };
    });
  },
  
  // Set AI processed filter
  setAiProcessedFilter: (value) => {
    set(state => ({
      filters: {
        ...state.filters,
        aiProcessed: value
      }
    }));
  },
  
  // Set pagination
  setPagination: (page, limit) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        page: page || state.pagination.page,
        limit: limit || state.pagination.limit
      }
    }));
  },
  
  // Set sort options
  setSort: (sortBy, sortOrder) => {
    set({
      sortBy: sortBy || get().sortBy,
      sortOrder: sortOrder || get().sortOrder
    });
  },
  
  // Reset filters
  resetFilters: () => {
    set({
      filters: {
        mediaTypes: [],
        dateRange: {
          start: null,
          end: null
        },
        tags: [],
        aiProcessed: null
      }
    });
  },
  
  // Perform global search
  globalSearch: async () => {
    const { query } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const data = await searchService.globalSearch(query);
      
      set({ 
        results: data.results,
        pagination: {
          ...get().pagination,
          total: data.total
        },
        isLoading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error performing global search:', error);
      set({ 
        error: error.response?.data?.message || 'Search failed',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Search failed' };
    }
  },
  
  // Perform advanced search with filters
  advancedSearch: async () => {
    const { query, filters, pagination, sortBy, sortOrder } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const searchParams = {
        query,
        filters,
        pagination,
        sort: {
          by: sortBy,
          order: sortOrder
        }
      };
      
      const data = await searchService.advancedSearch(searchParams);
      
      set({ 
        results: data.results,
        pagination: {
          ...pagination,
          total: data.total
        },
        isLoading: false 
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error performing advanced search:', error);
      set({ 
        error: error.response?.data?.message || 'Advanced search failed',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Advanced search failed' };
    }
  },
  
  // Clear search results
  clearResults: () => set({ results: [] }),
  
  // Clear error
  clearError: () => set({ error: null })
}));

export default useSearchStore;