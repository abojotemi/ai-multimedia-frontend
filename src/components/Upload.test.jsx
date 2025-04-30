import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Upload from './Upload';
import { mediaService } from '../api/apiService';

// Mock the mediaService
vi.mock('../api/apiService', () => ({
  mediaService: {
    uploadMedia: vi.fn().mockResolvedValue({ success: true })
  }
}));

// Mock the URL.createObjectURL function
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

describe('Upload Component', () => {
  beforeEach(() => {
    // Clear mocks between tests
    vi.clearAllMocks();
  });

  it('renders the upload component', () => {
    render(<Upload />);
    
    // Check if the component title is rendered
    expect(screen.getByText('Upload Media Files')).toBeInTheDocument();
    
    // Check if the drag and drop area is rendered
    expect(screen.getByText('Drag and drop files here')).toBeInTheDocument();
  });
});