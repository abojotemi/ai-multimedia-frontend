import React from "react";
import { X, Send } from "lucide-react";

export default function AIActionPanel({ actionMode, prompt, setPrompt, onSubmit, onCancel }) {
  if (!actionMode) return null;
  
  const getActionTitle = () => {
    switch (actionMode) {
      case "generate-tags": return "Generate Tags";
      case "transcribe": return "Transcribe Media";
      case "analyze": return "Analyze Content";
      case "custom-prompt": return "Custom AI Task";
      default: return "AI Action";
    }
  };
  
  const getActionDescription = () => {
    switch (actionMode) {
      case "generate-tags": 
        return "AI will analyze your selected media and generate relevant tags.";
      case "transcribe": 
        return "Convert audio in your media to text. Works with videos and audio files.";
      case "analyze": 
        return "Get detailed insights about your content from our AI.";
      case "custom-prompt": 
        return "Provide custom instructions for the AI to process your selected media.";
      default: 
        return "Describe what you want the AI to do with your selected media.";
    }
  };
  
  const getPromptPlaceholder = () => {
    switch (actionMode) {
      case "generate-tags": 
        return "E.g. Focus on technical terms, or include marketing keywords...";
      case "transcribe": 
        return "E.g. Include speaker identification, or focus on technical terms...";
      case "analyze": 
        return "E.g. Extract key insights, or identify main themes...";
      case "custom-prompt": 
        return "Describe exactly what you want the AI to do with your selected media...";
      default: 
        return "Enter your instructions for the AI...";
    }
  };

  return (
    <div className="bg-jasper-50 border border-jasper-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-jasper-700">{getActionTitle()}</h3>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>
      </div>
      
      <p className="text-sm text-jasper-600 mb-3">
        {getActionDescription()}
      </p>
      
      <form onSubmit={onSubmit} className="flex space-x-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={getPromptPlaceholder()}
          className="flex-1 px-3 py-2 border border-jasper-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jasper-500"
        />
        <button
          type="submit"
          className="bg-jasper-600 hover:bg-jasper-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Send size={16} className="mr-2" />
          Process
        </button>
      </form>
    </div>
  );
}