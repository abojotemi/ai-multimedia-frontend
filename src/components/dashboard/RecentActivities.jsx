import React from "react";
import { Clock, User, FileText, RefreshCw } from "lucide-react";

export default function RecentActivities({ activities, isLoading }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Activities</h2>
        <Clock className="text-green-500" />
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-green-50 rounded-full p-2 mt-1">
                <User size={16} className="text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  <span className="text-gray-700">{activity.user}</span>{" "}
                  <span className="text-gray-500">{activity.action}</span>{" "}
                  <span className="text-gray-700">{activity.item}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
          
          <button className="w-full mt-2 text-center text-sm text-jasper-600 hover:text-jasper-800 flex items-center justify-center">
            <RefreshCw size={14} className="mr-2" />
            Load more activities
          </button>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <FileText className="mx-auto mb-2 text-gray-400" size={32} />
          <p>No recent activities found</p>
        </div>
      )}
    </div>
  );
}