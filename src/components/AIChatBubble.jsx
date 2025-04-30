import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Minimize, Maximize, MessageSquare } from "lucide-react";
import { chatService } from "../api/apiService";

export default function AIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    try {
      // Convert messages to the format expected by the backend
      const chatMessages = messages.map(msg => ({
        role: msg.role === "assistant" ? "ai" : msg.role,
        text: msg.content
      }));
      
      // Add the new user message
      chatMessages.push({
        role: "user",
        text: userMessage.content
      });
      
      // Send to the backend
      const response = await chatService.sendMessage(chatMessages);
      
      // Add the AI response to messages
      const aiResponse = { 
        role: "assistant", 
        content: response.response
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl mb-4 w-full max-w-[calc(100vw-32px)] sm:max-w-[400px] md:max-w-[400px] flex flex-col max-h-[60vh] sm:max-h-[600px] border border-gray-200">
          {/* Chat Header */}
          <div className="p-3 sm:p-4 border-b bg-jasper-600 text-white rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <Bot className="mr-2" size={18} />
              <h3 className="font-medium text-sm sm:text-base">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-200 focus:outline-none p-1"
              >
                <Minimize size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-200 focus:outline-none p-1"
              >
                <X size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`max-w-[80%] ${
                  msg.role === "user" 
                    ? "self-end bg-jasper-100 text-jasper-900" 
                    : "self-start bg-gray-100 text-gray-800"
                } rounded-lg p-2 sm:p-3 text-sm sm:text-base`}
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className="self-start bg-gray-100 text-gray-800 rounded-lg p-2 sm:p-3 max-w-[80%]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="border-t p-2 sm:p-4 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-jasper-500"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`bg-jasper-600 text-white rounded-md px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center ${
                !inputValue.trim() || isTyping ? "opacity-50 cursor-not-allowed" : "hover:bg-jasper-700"
              }`}
            >
              <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </form>
        </div>
      )}
      
      {/* Chat Bubble Button */}
      <button
        onClick={() => {
          // Reset the conversation if we're opening a closed chat bubble
          if (!isOpen) {
            setMessages([
              { role: "assistant", content: "Hello! How can I help you today?" }
            ]);
          }
          setIsOpen(prev => !prev);
        }}
        className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shadow-lg ${
          isOpen ? "bg-red-500 hover:bg-red-600" : "bg-jasper-600 hover:bg-jasper-700"
        } text-white focus:outline-none transition-colors`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={20} className="sm:w-6 sm:h-6" /> : <MessageSquare size={20} className="sm:w-6 sm:h-6" />}
      </button>
    </div>
  );
}