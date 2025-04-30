# Frontend and Backend Integration

This document provides instructions for connecting the frontend to the backend API.

## Configuration

The frontend is set up to communicate with the backend through a proxy defined in the Vite configuration file.

### Development Mode

In development mode:

1. Start the backend server: 
   ```bash
   cd backend
   python -m src.main
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will automatically proxy API requests to the backend server running on http://localhost:8000.

## API Services

The frontend uses the following API services to communicate with the backend:

- **Authentication**: Login, register, logout
- **Media**: Upload, retrieve, search media files
- **AI Processing**: Process media with AI, generate tags, perform OCR, etc.
- **Collections**: Organize media into collections
- **Dashboard**: Get statistics and activity data

## AI Features

The AI processing features include:

### Images
- Object/Face Recognition
- Content Moderation
- OCR Text Extraction
- Auto-Tagging

### Videos
- Object/Scene Recognition
- Audio Transcription
- Content Moderation
- Video Summarization

### Audio
- Audio Transcription
- Content Moderation
- Emotion Analysis
- Speaker Identification

### Documents
- OCR Processing
- Document Summarization
- Document Classification
- Entity Extraction

## Authentication

The authentication flow uses JWT tokens:
- Access token is stored in localStorage
- Refresh token is stored in an HTTP-only cookie
- The axios interceptor handles token refresh automatically

## Troubleshooting

If you encounter issues with the API connection:

1. Ensure the backend server is running on port 8000
2. Check browser console for CORS errors
3. Verify that the proxy settings in vite.config.js are correct
4. Check that the backend CORS settings include the frontend URL 