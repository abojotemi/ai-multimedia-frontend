import { create } from 'zustand'
import { searchService } from '../api/apiService'

const learnStore = create((set) => ({
    articles: [],
    videos: [],
    isLoading: false,
    setLinks: async (query) => {
        try {
            set({isLoading: true});
            // Use searchService instead of direct API call
            const response = await searchService.advancedSearch({
                query,
                type: 'learn'
            });
            
            if (response && response.articles && response.videos) {
                set({
                    articles: response.articles || [],
                    videos: response.videos || []
                });
            } else {
                set({ articles: [], videos: [] });
                console.error('Invalid response format');
            }
        } catch (error) {
            console.error(error);
            set({ articles: [], videos: [] });
        } finally {
            set({isLoading: false});
        }
    }
}));

export default learnStore;
