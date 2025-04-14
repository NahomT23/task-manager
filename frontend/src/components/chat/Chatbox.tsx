import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import io from 'socket.io-client';
import { AiOutlineMessage, AiOutlineClose, AiOutlineCopy } from "react-icons/ai";
import { BsThreeDots } from "react-icons/bs";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from '../../store/authStore';

interface Message {
  text: string;
  isMine: boolean;
  timestamp: Date;
}

const socket = io('http://localhost:3000');

const Chatbox = () => {
  const [open, setOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useThemeStore();
  const { user } = useAuthStore(); 

  // When the chat window opens for the first time, you can optionally preload a welcome message.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        text: `Welcome! How can I assist you today?`,
        isMine: false,
        timestamp: new Date()
      }]);
    }
  }, [open]);

  // When the chat window opens, join the chat room and set up listeners.
  useEffect(() => {
    if (open) {
      // You can use a default room (e.g. 'chat') or assume room join is already handled.
      socket.emit('join_room', 'chat');  


      socket.on('room_messages', (msgs: any[]) => {
        const parsedMessages = msgs.map((msg) => ({
          text: msg.message || msg.text,

          isMine: msg.username === (user?.name || 'User'),
          timestamp: new Date(msg.timestamp)
        }));
        setMessages((prev) => [...prev, ...parsedMessages]);
      });

      // Listen for new incoming messages.
      socket.on('receive_message', (msg: any) => {
        const newMsg: Message = {
          text: msg.message || msg.text,
          isMine: msg.username === (user?.name || 'User'),
          timestamp: new Date(msg.timestamp)
        };
        setMessages((prev) => [...prev, newMsg]);
      });
    }

    return () => {
      socket.off('room_messages');
      socket.off('receive_message');
    };
  }, [open, user]);

  // Scroll to the bottom when messages or the loading indicator update.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Copy text to clipboard and show a temporary indicator.
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle message submission by sending it through Socket.IO and updating local state.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      text: inputMessage,
      isMine: true,
      timestamp: new Date()
    };

    // Emit the message to the backend.
    socket.emit('send_message', {
      room: 'chat',
      username: user?.name || 'User',
      message: inputMessage,
      time: new Date().toISOString()
    });


    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {open && (
          <div className={`mb-4 w-64 sm:w-80 h-96 flex flex-col rounded-lg p-2 shadow-lg border transition-all duration-300 ${
            isDarkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-900 border-gray-300"
          }`}>
            {/* Header */}
            <div className="flex justify-end items-center mb-2 p-2">
              <button onClick={() => setOpen(false)} className="text-lg">
                <AiOutlineClose />
              </button>
            </div>
            
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-1 mb-2 space-y-2">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isMine ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
                  <div className={`max-w-[85%] p-2 rounded-lg ${
                    msg.isMine 
                      ? (isDarkMode ? "bg-blue-900" : "bg-blue-500 text-white") 
                      : (isDarkMode ? "bg-gray-700" : "bg-gray-100")
                  }`}>
                    <div className="prose prose-sm max-w-none break-words text-xs">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {/* Timestamp and copy button for others' messages */}
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      msg.isMine ? "text-blue-100" : (isDarkMode ? "text-gray-400" : "text-gray-600")
                    }`}>
                      <span>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!msg.isMine && (
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
              {/* Loading indicator */}
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
          </div>
        )}

        {/* Chat toggle button */}
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

        {/* Copied indicator */}
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

export default Chatbox;
