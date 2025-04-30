import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIProcessing from './AIProcessing';
import { mediaService, aiService } from '../api/apiService';

// Mock the API services
vi.mock('../api/apiService', () => ({
  mediaService: {
    getAllMedia: vi.fn().mockResolvedValue([
      { id: 'item-0', name: 'Item 1', file_type: 'image' },
      { id: 'item-1', name: 'Item 2', file_type: 'image' },
      { id: 'item-2', name: 'Item 3', file_type: 'image' }
    ])
  },
  aiService: {
    processMedia: vi.fn().mockResolvedValue({ status: 'success', jobId: '123' }),
    getProcessingStatus: vi.fn().mockResolvedValue({ status: 'completed' })
  }
}));

describe('AIProcessing Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component correctly', async () => {
    render(<AIProcessing />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Processing Center')).toBeInTheDocument();
    });
  });

  it('selects only one item when clicked', async () => {
    render(<AIProcessing />);
    
    // Wait for media items to load
    await waitFor(() => {
      expect(screen.getByText('0 selected')).toBeInTheDocument();
    });
    
    // Find all media items
    const mediaItems = document.querySelectorAll('.aspect-square');
    expect(mediaItems.length).toBeGreaterThan(0);
    
    // Click on the first item
    fireEvent.click(mediaItems[0]);
    
    // Check that only one item is selected
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    
    // Click on the second item
    fireEvent.click(mediaItems[1]);
    
    // Check that now two items are selected
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    
    // Click on the first item again to deselect it
    fireEvent.click(mediaItems[0]);
    
    // Check that now only one item is selected
    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('shows loading animation during processing', async () => {
    // Mock the processMedia function to delay resolution
    aiService.processMedia.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ status: 'success', jobId: '123' });
        }, 100);
      });
    });

    render(<AIProcessing />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Object/Face Recognition')).toBeInTheDocument();
    });
    
    // Select a processing option
    const option = screen.getByText('Object/Face Recognition');
    fireEvent.click(option);
    
    // Mock selecting an item
    const itemElements = document.querySelectorAll('.aspect-square');
    if (itemElements.length > 0) {
      fireEvent.click(itemElements[0]);
    }
    
    // Now the button should be enabled and we can click it
    await waitFor(() => {
      const processButton = screen.getByText('Process Selected Items');
      fireEvent.click(processButton);
    });
    
    // Check that loading animation is shown
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });
});

