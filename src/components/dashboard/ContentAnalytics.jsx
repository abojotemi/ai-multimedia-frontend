import React from "react";
import { BarChart, BarChart3, Tag, Clock } from "lucide-react";

export default function ContentAnalytics({ analytics, isLoading }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Content Analytics</h2>
        <BarChart3 className="text-blue-500" />
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Media Type Distribution */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Media Type Distribution</h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-blue-50 p-3 rounded text-center">
                <div className="text-lg font-semibold">{analytics.mediaTypeDistribution.images}</div>
                <div className="text-xs text-gray-500">Images</div>
              </div>
              <div className="bg-green-50 p-3 rounded text-center">
                <div className="text-lg font-semibold">{analytics.mediaTypeDistribution.videos}</div>
                <div className="text-xs text-gray-500">Videos</div>
              </div>
              <div className="bg-purple-50 p-3 rounded text-center">
                <div className="text-lg font-semibold">{analytics.mediaTypeDistribution.audio}</div>
                <div className="text-xs text-gray-500">Audio</div>
              </div>
              {/* <div className="bg-amber-50 p-3 rounded text-center">
                <div className="text-lg font-semibold">{analytics.mediaTypeDistribution.documents}</div>
                <div className="text-xs text-gray-500">Docs</div>
              </div> */}
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <div className="flex items-center mb-2">
              <Tag className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-600">Popular Tags</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {analytics.popularTags && analytics.popularTags.length > 0 ? (
                analytics.popularTags.map((tag, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <span>{tag.name}</span>
                    <span className="ml-2 bg-gray-200 px-1.5 py-0.5 rounded-full text-xs">
                      {tag.count}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No tags yet</div>
              )}
            </div>
          </div>

          {/* AI Processing Savings */}
          {/* <div>
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 text-gray-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-600">AI Processing Efficiency</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-lg font-semibold">{analytics.aiProcessingSavings.efficiency}%</div>
                <div className="text-xs text-gray-500">Processing Efficiency</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{analytics.aiProcessingSavings.timeSaved} hrs</div>
                <div className="text-xs text-gray-500">Time Saved</div>
              </div>
            </div>
          </div> */}

          {/* Assets Count */}
          {analytics.totalAssets !== undefined && (
            <div className="flex justify-between items-center text-sm text-gray-600 mt-4 pt-4 border-t">
              <div>Total Assets: <span className="font-semibold">{analytics.totalAssets}</span></div>
              {analytics.uploadCount !== undefined && (
                <div>Total Uploads: <span className="font-semibold">{analytics.uploadCount}</span></div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
