import React from "react";
import { Brain, RefreshCw, Check, AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import useAiStore from "../../store/aiStore";

export default function ProcessingCard() {
  const { isProcessing, currentJob, processingProgress, error } = useAiStore();
  
  // If there's no active processing and no recent results, don't show the card
  if (!isProcessing && !currentJob) {
    return null;
  }
  
  // Check if there's an error
  const hasError = error || (currentJob && currentJob.status === "failed");
  
  // Check if processing is complete
  const isComplete = currentJob && currentJob.status === "completed";
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold flex items-center">
          <Brain className="w-5 h-5 mr-2 text-jasper-600" />
          AI Processing
        </h2>
        {isProcessing && (
          <div className="flex items-center text-jasper-500">
            <RefreshCw size={14} className="mr-1 animate-spin" />
            <span className="text-sm">Processing</span>
          </div>
        )}
        {isComplete && (
          <div className="flex items-center text-green-500">
            <Check size={14} className="mr-1" />
            <span className="text-sm">Complete</span>
          </div>
        )}
        {hasError && (
          <div className="flex items-center text-red-500">
            <AlertTriangle size={14} className="mr-1" />
            <span className="text-sm">Error</span>
          </div>
        )}
      </div>
      
      {isProcessing && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-jasper-500 h-2.5 rounded-full" 
              style={{ width: `${processingProgress || 10}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Processing</span>
            <span className="text-xs text-gray-500">{processingProgress || 0}%</span>
          </div>
        </div>
      )}
      
      <div className="text-sm">
        {isProcessing && (
          <p>AI is currently processing your media...</p>
        )}
        
        {isComplete && (
          <p>Your media has been processed successfully.</p>
        )}
        
        {hasError && (
          <p className="text-red-600">
            {error || "There was an error processing your media."}
          </p>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link 
          to="/ai-processing" 
          className="flex items-center text-jasper-600 text-sm hover:text-jasper-700"
        >
          <span>Go to AI Processing Center</span>
          <ExternalLink size={14} className="ml-1" />
        </Link>
      </div>
    </div>
  );
} 