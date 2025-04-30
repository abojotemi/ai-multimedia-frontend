import { create } from 'zustand'
import { mediaService, aiService } from '../api/apiService'
import dashboardStore from './dashboardStore'

const useUploadStore = create((set, get) => ({
  // Files state
  files: [],
  uploadProgress: {},
  isUploading: false,
  isProcessing: false,
  previewFile: null,
  previewOpen: false,
  processingOptions: {
    ocr: false,
    transcription: false,
    generateTags: true
  },
  error: null,

  // Set files to upload
  setFiles: (newFiles) => {
    set(state => ({
      files: [...state.files, ...newFiles]
    }));
  },

  // Remove file from upload list
  removeFile: (fileId) => {
    set(state => {
      // Close preview if the removed file was being previewed
      if (state.previewFile && state.previewFile.id === fileId) {
        return {
          files: state.files.filter(file => file.id !== fileId),
          previewFile: null,
          previewOpen: false
        };
      }

      return {
        files: state.files.filter(file => file.id !== fileId)
      };
    });
  },

  // Clear all files
  clearFiles: () => set({ files: [] }),

  // Update upload progress for a file
  updateProgress: (fileId, progress) => {
    set(state => ({
      uploadProgress: {
        ...state.uploadProgress,
        [fileId]: progress
      }
    }));
  },

  // Set preview file
  setPreviewFile: (file) => set({ previewFile: file }),

  // Toggle preview modal
  togglePreview: (isOpen, file = null) => {
    if (isOpen && file) {
      set({ previewFile: file, previewOpen: true });
    } else {
      set({ previewOpen: false });
      // Don't immediately clear the previewFile to prevent layout shifts
      setTimeout(() => set({ previewFile: null }), 200);
    }
  },

  // Toggle processing options
  toggleProcessingOption: (option) => {
    set(state => ({
      processingOptions: {
        ...state.processingOptions,
        [option]: !state.processingOptions[option]
      }
    }));
  },

  // Process files before upload (generate metadata, etc.)
  processNewFiles: (newFiles) => {
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
        set(state => ({
          error: `File "${file.name}" has an unsupported file type. Only ${allowedExtensions.join(', ')} are supported.`
        }));
        return false;
      }

      if (!isValidSize) {
        set(state => ({
          error: `File "${file.name}" exceeds the 50MB size limit.`
        }));
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
      } else if (
        [
          "pdf",
          "doc",
          "docx",
          "txt",
          "rtf",
          "ppt",
          "pptx",
          "xls",
          "xlsx",
        ].includes(extension)
      ) {
        fileType = "document";
      }

      // Create preview URL for supported types
      const previewUrl = URL.createObjectURL(file);

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
          tags: [], // Remove placeholder tags, will be filled by backend
          customFields: {},
        },
        aiProcessed: false,
      };
    });

    // Add files to state
    set(state => ({
      files: [...state.files, ...filesWithMetadata],
      error: null
    }));

    return filesWithMetadata;
  },

  // Upload files to server
  uploadFiles: async () => {
    const { files, processingOptions } = get();

    if (files.length === 0) {
      return { success: false, error: 'No files to upload' };
    }

    set({ isUploading: true, error: null });

    try {
      // Create FormData to send files
      const formData = new FormData();

      // Add each file to the form data
      files.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });

      // Add processing options
      formData.append('processingOptions', JSON.stringify(processingOptions));

      // Upload files
      const result = await mediaService.uploadMedia(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);

        // Update progress for all files
        files.forEach(fileObj => {
          get().updateProgress(fileObj.id, percentCompleted);
        });
      });

      // Clear files after successful upload
      set({
        files: [],
        uploadProgress: {},
        isUploading: false
      });

      // Refresh dashboard data to reflect the newly uploaded files
      await dashboardStore.getState().fetchAllDashboardData();

      return { success: true, data: result };
    } catch (error) {
      console.error('Upload error:', error);
      set({
        isUploading: false,
        error: error.response?.data?.message || 'Failed to upload files'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to upload files' };
    }
  },

  // Process uploaded media with AI
  processMediaWithAI: async (mediaIds, options) => {
    set({ isProcessing: true, error: null });

    try {
      const result = await aiService.processMedia(mediaIds, options);
      set({ isProcessing: false });
      return { success: true, data: result };
    } catch (error) {
      console.error('AI processing error:', error);
      set({
        isProcessing: false,
        error: error.response?.data?.message || 'Failed to process media with AI'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to process media with AI' };
    }
  },

  // Process media with custom AI prompt
  processWithCustomPrompt: async (mediaIds, prompt) => {
    set({ isProcessing: true, error: null });

    try {
      const result = await aiService.processWithPrompt(mediaIds, prompt);
      set({ isProcessing: false });
      return { success: true, data: result };
    } catch (error) {
      console.error('Custom AI processing error:', error);
      set({
        isProcessing: false,
        error: error.response?.data?.message || 'Failed to process media with custom prompt'
      });
      return { success: false, error: error.response?.data?.message || 'Failed to process media with custom prompt' };
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useUploadStore;