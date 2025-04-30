import { create } from 'zustand'
import { aiService } from '../api/apiService'

const useAiStore = create((set, get) => ({
  // AI processing state
  processingJobs: [],
  currentJob: null,
  isProcessing: false,
  processingProgress: 0,
  processingResults: null,
  error: null,
  
  // Process media with AI
  processMedia: async (mediaIds, options) => {
    set({ isProcessing: true, processingProgress: 0, error: null });
    
    try {
      const data = await aiService.processMedia(mediaIds, options);
      
      // Add job to processing jobs
      set(state => ({
        processingJobs: [...state.processingJobs, data],
        currentJob: data,
        isProcessing: true,
        processingProgress: 10 // Initial progress
      }));
      
      // Start polling for job status
      get().pollJobStatus(data.jobId);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error processing media with AI:', error);
      set({ 
        isProcessing: false,
        error: error.response?.data?.message || 'Failed to process media with AI'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to process media with AI' };
    }
  },
  
  // Poll job status
  pollJobStatus: async (jobId) => {
    const checkStatus = async () => {
      try {
        const status = await aiService.getProcessingStatus(jobId);
        
        set({ 
          processingProgress: status.progress,
          currentJob: status
        });
        
        if (status.status === 'completed') {
          set({ 
            isProcessing: false,
            processingResults: status.results
          });
        } else if (status.status === 'failed') {
          set({ 
            isProcessing: false,
            error: status.error || 'AI processing failed'
          });
        } else {
          // Continue polling
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        console.error('Error polling job status:', error);
        set({ 
          isProcessing: false,
          error: error.response?.data?.message || 'Failed to get processing status'
        });
      }
    };
    
    // Start polling
    checkStatus();
  },
  
  // Generate AI tags for media
  generateTags: async (mediaId) => {
    set({ isProcessing: true, error: null });
    
    try {
      const data = await aiService.generateTags(mediaId);
      set({ isProcessing: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error generating AI tags:', error);
      set({ 
        isProcessing: false,
        error: error.response?.data?.message || 'Failed to generate AI tags'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to generate AI tags' };
    }
  },
  
  // Perform OCR on document or image
  performOcr: async (mediaId) => {
    set({ isProcessing: true, error: null });
    
    try {
      const data = await aiService.performOcr(mediaId);
      set({ isProcessing: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error performing OCR:', error);
      set({ 
        isProcessing: false,
        error: error.response?.data?.message || 'Failed to perform OCR'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to perform OCR' };
    }
  },
  
  // Transcribe audio or video
  transcribeMedia: async (mediaId) => {
    set({ isProcessing: true, error: null });
    
    try {
      const data = await aiService.transcribeMedia(mediaId);
      set({ isProcessing: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error transcribing media:', error);
      set({ 
        isProcessing: false,
        error: error.response?.data?.message || 'Failed to transcribe media'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to transcribe media' };
    }
  },
  
  // Generate AI description for media
  generateDescription: async (mediaId) => {
    set({ isProcessing: true, error: null });
    
    try {
      const data = await aiService.generateDescription(mediaId);
      set({ isProcessing: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error generating description:', error);
      set({ 
        isProcessing: false,
        error: error.response?.data?.message || 'Failed to generate description'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to generate description' };
    }
  },
  
  // Process media with custom AI prompt
  processWithPrompt: async (mediaIds, prompt) => {
    set({ isProcessing: true, error: null });
    
    try {
      const data = await aiService.processWithPrompt(mediaIds, prompt);
      set({ isProcessing: false });
      return { success: true, data };
    } catch (error) {
      console.error('Error processing with custom prompt:', error);
      set({ 
        isProcessing: false,
        error: error.response?.data?.message || 'Failed to process with custom prompt'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to process with custom prompt' };
    }
  },
  
  // Clear processing results
  clearResults: () => set({ processingResults: null }),
  
  // Clear error
  clearError: () => set({ error: null })
}));

export default useAiStore;