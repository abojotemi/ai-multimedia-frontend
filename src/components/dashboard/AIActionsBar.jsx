import React from "react";
import { Brain, Sparkles, Tag, FileAudio, Wand2 } from "lucide-react";

export default function AIActionsBar({ onActionSelect, selectedAction, selectedItemsCount = 0 }) {
  const aiActions = [
    {
      id: "generate-tags",
      label: "Generate Tags",
      icon: <Tag className="w-5 h-5" />,
      description: "Auto-generate tags for your media"
    },
    {
      id: "transcribe",
      label: "Transcribe",
      icon: <FileAudio className="w-5 h-5" />,
      description: "Transcribe audio and video content"
    },
    {
      id: "analyze",
      label: "Analyze",
      icon: <Brain className="w-5 h-5" />,
      description: "Analyze content and get insights"
    },
    {
      id: "custom-prompt",
      label: "Custom AI Task",
      icon: <Wand2 className="w-5 h-5" />,
      description: "Create a custom AI task with your own prompt"
    }
  ];

  const isDisabled = selectedItemsCount === 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">AI Actions</h2>
        <Sparkles className="text-amber-500" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {aiActions.map((action) => (
          <button
            key={action.id}
            onClick={() => !isDisabled && onActionSelect(action.id)}
            className={`
              flex flex-col items-center justify-center p-4 border rounded-lg transition-all
              ${selectedAction === action.id 
                ? 'border-jasper-500 bg-jasper-50' 
                : 'border-gray-200 hover:border-jasper-200 hover:bg-jasper-50'}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={isDisabled}
          >
            <div className={`
              p-3 rounded-full mb-2
              ${selectedAction === action.id ? 'bg-jasper-100' : 'bg-gray-100'}
            `}>
              {action.icon}
            </div>
            <span className="font-medium">{action.label}</span>
            <span className="text-xs text-center text-gray-500 mt-1">{action.description}</span>
            {selectedAction === action.id && (
              <div className="w-full mt-2 pt-2 border-t border-jasper-200">
                <div className="text-xs text-center text-jasper-600">Selected</div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {isDisabled && (
        <div className="mt-3 text-sm text-gray-500 text-center">
          Select media items to enable AI actions
        </div>
      )}
    </div>
  );
}