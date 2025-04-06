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

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useThemeStore();
  const { user } = useAuthStore();
  const { orgName } = useOrganizationStore();

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        text: `Hello ${user?.name || 'there'}, how can I assist you today?`,
        isBot: true,
        timestamp: new Date()
      }]);
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {open && (
          <div className={`mb-4 w-64 sm:w-80 h-96 flex flex-col rounded-lg p-2 shadow-lg border transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-900 border-gray-300"
          }`}>
            <div className="flex justify-between items-center mb-2 p-2">
              <h4 className="text-sm font-semibold">Chat with {orgName}'s AI</h4>
              <button onClick={() => setOpen(false)} className="text-lg">
                <AiOutlineClose />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-1 mb-2 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isBot ? 'flex-row' : 'flex-row-reverse'} gap-2`}>
                  <div className={`max-w-[85%] p-2 rounded-lg ${
                    msg.isBot 
                      ? (isDarkMode ? "bg-gray-700" : "bg-gray-100") 
                      : (isDarkMode ? "bg-blue-900" : "bg-blue-500 text-white")
                  }`}>

                    <div className="prose prose-sm max-w-full break-words text-xs">
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

            <form onSubmit={handleSubmit} className="flex gap-1">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className={`flex-1 p-2 text-sm rounded-lg focus:outline-none ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              />
              <button
                type="submit"
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-400"
                } text-white`}
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl transition-all duration-300 border ${
            isDarkMode
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700"
              : "bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
          }`}
        >
          {open ? <AiOutlineClose /> : <AiOutlineMessage />}
        </button>

        {copied && (
          <div className={`fixed bottom-20 right-6 p-2 rounded-lg text-sm ${
            isDarkMode ? "bg-gray-700" : "bg-gray-100"
          }`}>
            Copied to clipboard!
          </div>
        )}
      </div>
    </>
  );
};

export default Chatbot;