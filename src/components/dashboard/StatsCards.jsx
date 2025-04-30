import React from "react";
import {
  BarChart3,
  Files,
  LayoutGrid,
  Lightbulb,
  HardDrive,
  Calendar,
  Upload
} from "lucide-react";

export default function StatsCards({ stats, isLoading }) {
  const formatStorageSize = (sizeInGB) => {
    if (sizeInGB < 1) {
      return `${Math.round(sizeInGB * 1000)} MB`;
    }
    return `${sizeInGB.toFixed(1)} GB`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Assets Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Assets</p>
            {isLoading ? (
              <div className="h-7 w-16 animate-pulse bg-gray-200 rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-semibold">{stats.totalAssets}</p>
            )}
          </div>
          <div className="bg-amber-50 p-3 rounded-full">
            <Files className="w-6 h-6 text-amber-500" />
          </div>
        </div>
        {!isLoading && stats.mediaTypeCounts && (
          <div className="mt-3 text-xs text-gray-500">
            <span className="inline-block mr-2">
              {stats.mediaTypeCounts.image || 0} images
            </span>
            <span className="inline-block mr-2">
              {stats.mediaTypeCounts.video || 0} videos
            </span>
            <span className="inline-block mr-2">
              {stats.mediaTypeCounts.audio || 0} audio                                                                                                
            </span>
            {/* <span className="inline-block">
              {stats.mediaTypeCounts.document || 0} docs
            </span> */}
          </div>
        )}
      </div>

      {/* Storage Used Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Storage Used</p>
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse bg-gray-200 rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-semibold">
                {formatStorageSize(stats.storageUsed.used)} 
                <span className="text-sm text-gray-500 font-normal">
                  / {formatStorageSize(stats.storageUsed.total)}
                </span>
              </p>
            )}
          </div>
          <div className="bg-blue-50 p-3 rounded-full">
            <HardDrive className="w-6 h-6 text-blue-500" />
          </div>
        </div>
        {!isLoading && (
          <div className="mt-3">
            <div className="relative w-full h-2 bg-gray-100 rounded-full">
              <div
                className="absolute top-0 left-0 h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min(stats.storageUsed.percentage, 100)}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-500 text-right">
              {stats.storageUsed.percentage.toFixed(1)}% used
            </div>
          </div>
        )}
      </div>

      {/* Last Upload Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Last Upload</p>
            {isLoading ? (
              <div className="h-7 w-24 animate-pulse bg-gray-200 rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-semibold">
                {formatDate(stats.lastUploadDate)}
              </p>
            )}
          </div>
          <div className="bg-green-50 p-3 rounded-full">
            <Upload className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Processing Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Processing</p>
            {isLoading ? (
              <div className="h-7 w-16 animate-pulse bg-gray-200 rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-semibold">{stats.processing}</p>
            )}
          </div>
          <div className="bg-purple-50 p-3 rounded-full">
            <LayoutGrid className="w-6 h-6 text-purple-500" />
          </div>
        </div>
        {!isLoading && stats.processing > 0 && (
          <div className="mt-3">
            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
              Items currently being processed
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


