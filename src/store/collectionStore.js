import { create } from 'zustand'
import { collectionService } from '../api/apiService'

const useCollectionStore = create((set, get) => ({
  // Collections state
  collections: [],
  currentCollection: null,
  isLoading: false,
  error: null,
  
  // Fetch all collections
  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await collectionService.getAllCollections();
      set({ collections: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching collections:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch collections',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to fetch collections' };
    }
  },
  
  // Fetch collection by ID
  fetchCollectionById: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await collectionService.getCollectionById(id);
      set({ currentCollection: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error(`Error fetching collection ${id}:`, error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch collection',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to fetch collection' };
    }
  },
  
  // Create new collection
  createCollection: async (collectionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await collectionService.createCollection(collectionData);
      set(state => ({ 
        collections: [...state.collections, data],
        isLoading: false 
      }));
      return { success: true, data };
    } catch (error) {
      console.error('Error creating collection:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to create collection',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to create collection' };
    }
  },
  
  // Update collection
  updateCollection: async (id, collectionData) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await collectionService.updateCollection(id, collectionData);
      
      set(state => ({
        collections: state.collections.map(collection => 
          collection.id === id ? data : collection
        ),
        currentCollection: state.currentCollection?.id === id ? data : state.currentCollection,
        isLoading: false
      }));
      
      return { success: true, data };
    } catch (error) {
      console.error(`Error updating collection ${id}:`, error);
      set({ 
        error: error.response?.data?.message || 'Failed to update collection',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to update collection' };
    }
  },
  
  // Delete collection
  deleteCollection: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await collectionService.deleteCollection(id);
      
      set(state => ({
        collections: state.collections.filter(collection => collection.id !== id),
        currentCollection: state.currentCollection?.id === id ? null : state.currentCollection,
        isLoading: false
      }));
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting collection ${id}:`, error);
      set({ 
        error: error.response?.data?.message || 'Failed to delete collection',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to delete collection' };
    }
  },
  
  // Add media to collection
  addMediaToCollection: async (collectionId, mediaIds) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await collectionService.addMediaToCollection(collectionId, mediaIds);
      
      // Update the current collection if it's the one being modified
      if (get().currentCollection?.id === collectionId) {
        set(state => ({
          currentCollection: {
            ...state.currentCollection,
            media: data.media
          },
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
      
      return { success: true, data };
    } catch (error) {
      console.error(`Error adding media to collection ${collectionId}:`, error);
      set({ 
        error: error.response?.data?.message || 'Failed to add media to collection',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to add media to collection' };
    }
  },
  
  // Remove media from collection
  removeMediaFromCollection: async (collectionId, mediaIds) => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await collectionService.removeMediaFromCollection(collectionId, mediaIds);
      
      // Update the current collection if it's the one being modified
      if (get().currentCollection?.id === collectionId) {
        set(state => ({
          currentCollection: {
            ...state.currentCollection,
            media: data.media
          },
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
      
      return { success: true, data };
    } catch (error) {
      console.error(`Error removing media from collection ${collectionId}:`, error);
      set({ 
        error: error.response?.data?.message || 'Failed to remove media from collection',
        isLoading: false 
      });
      return { success: false, error: error.response?.data?.message || 'Failed to remove media from collection' };
    }
  },
  
  // Set current collection
  setCurrentCollection: (collection) => set({ currentCollection: collection }),
  
  // Clear current collection
  clearCurrentCollection: () => set({ currentCollection: null }),
  
  // Clear error
  clearError: () => set({ error: null })
}));

export default useCollectionStore;