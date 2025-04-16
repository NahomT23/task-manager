import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axiosInstance from '../../api/axiosInstance';
import { AiOutlineMessage, AiOutlineClose, AiOutlineCopy } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from '../../store/authStore';
import { useOrganizationStore } from '../../store/organizationStore';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  toggle?: () => void;
  onClose: () => void;
}

const Chatbot = ({ toggle, onClose }: ChatbotProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useThemeStore();
  const { user } = useAuthStore();
  const { orgName } = useOrganizationStore();

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: `Hello ${user?.name || 'there'}, how can I assist you today?`,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false, timestamp: new Date() }]);
    
    try {
      setLoading(true);
      const response = await axiosInstance.post('/bot/chat', { message: userMessage });
      setMessages(prev => [...prev, {
        text: response.data.response,
        isBot: true,
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble responding right now. Please try again later.",
        isBot: true,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mb-4 w-64 sm:w-80 h-96 flex flex-col rounded-lg p-2 shadow-lg border transition-all duration-300 ${
      isDarkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-900 border-gray-300"
    }`}>
      <div className="flex justify-between items-center mb-2 p-2">
        <h4 className="text-sm font-semibold">Chat with {orgName}'s AI</h4>
        <div className="flex items-center gap-2">
          {toggle && (
            <button
              onClick={toggle}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isDarkMode 
                  ? "bg-gray-600 hover:bg-gray-500 text-white" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Switch to Group
            </button>
          )}
          <button onClick={onClose} className="text-lg">
            <AiOutlineClose />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1 mb-2 space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isBot ? 'flex-row' : 'flex-row-reverse'} gap-2`}>
            <div className={`max-w-[85%] p-2 rounded-lg ${
              msg.isBot 
                ? (isDarkMode ? "bg-gray-700" : "bg-gray-100") 
                : (isDarkMode ? "bg-blue-900" : "bg-blue-500 text-white")
            }`}>
              <div className="prose prose-sm max-w-none break-words text-xs">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              <div className={`flex items-center justify-between mt-1 text-xs ${
                msg.isBot ? (isDarkMode ? "text-gray-400" : "text-gray-600") : "text-blue-100"
              }`}>
                <span>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.isBot && (
                  <button 
                    onClick={() => handleCopy(msg.text)}
                    className="ml-2 hover:opacity-70"
                  >
                    <AiOutlineCopy size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex flex-row gap-2">
            <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <BsThreeDots className="animate-pulse" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-1 flex-nowrap">
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className={`flex-1 min-w-0 p-2 text-sm rounded-lg focus:outline-none ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        />
        <button
          type="submit"
          className={`flex-shrink-0 p-2 rounded-lg transition-colors duration-200 ${
            isDarkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"
          } text-white`}
        >
          Send
        </button>
      </form>

      {copied && (
        <div className={`fixed bottom-20 right-6 p-2 rounded-lg text-sm ${
          isDarkMode ? "bg-gray-700" : "bg-gray-100"
        }`}>
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default Chatbot;