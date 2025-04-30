import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCards } from './index';

describe('StatsCards Component', () => {
  const mockStats = {
    totalAssets: 120,
    recentlyAdded: 15,
    mediaUsage: {
      count: 42
    },
    processingQueue: {
      total: 5,
      ratios: {
        images: 40,
        videos: 30,
        audio: 20,
        documents: 10
      }
    }
  };

  test('renders loading state correctly', () => {
    render(<StatsCards stats={{}} isLoadingStats={true} />);
    
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBe(3);
  });

  test('renders stats data correctly', () => {
    render(<StatsCards stats={mockStats} isLoadingStats={false} />);
    
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    
    expect(screen.getByText('Total Assets')).toBeInTheDocument();
    expect(screen.getByText('Recently Added')).toBeInTheDocument();
    expect(screen.getByText('Media Usage')).toBeInTheDocument();
    
    expect(screen.getByText('Downloads this month')).toBeInTheDocument();
    expect(screen.getByText('In the last 7 days')).toBeInTheDocument();
  });

  test('renders progress bars correctly', () => {
    render(<StatsCards stats={mockStats} isLoadingStats={false} />);
    
    // Check for the labels in the progress bars
    expect(screen.getAllByText('Images').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Videos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Audio').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Docs').length).toBeGreaterThan(0);
  });
});