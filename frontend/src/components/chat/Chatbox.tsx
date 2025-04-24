import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { AiOutlineClose } from "react-icons/ai";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from '../../store/authStore';
import { useOrganizationStore } from '../../store/organizationStore';
import axiosInstance from '../../api/axiosInstance';
import { FaTrash } from 'react-icons/fa';

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    name: string;
    profileImageUrl?: string;
  };
  timestamp: Date;
}

interface ChatProps {
  toggle?: () => void;
  onClose: () => void;
}

const BACKEND_URL = import.meta.env.VITE_API_SOCKET_URL;

const Chat = ({ toggle, onClose }: ChatProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ [userId: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useThemeStore();
  const { user } = useAuthStore();
  const { orgName } = useOrganizationStore();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleClearChat = async () => {
    try {
      await axiosInstance.delete('/messages');
      setMessages([]); 
      setShowConfirm(false);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  useEffect(() => {
    // Remove orgName dependency
    const newSocket = io(BACKEND_URL, {
      auth: { token: localStorage.getItem('token') }
    });
  
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });
  
    newSocket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
  
    newSocket.on('updateOnlineStatus', (onlineData: { [userId: string]: number }) => {
      setOnlineUsers(onlineData);
    });
  
    socketRef.current = newSocket;
  
    return () => {
      newSocket.disconnect();
    };
  }, []); // Removed orgName dependency

  useEffect(() => {
    if (!orgName) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/messages?org=${orgName}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [orgName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !socketRef.current || !user || isSending) return;

    setIsSending(true);
    try {
      socketRef.current.emit('sendMessage', inputMessage);
      setInputMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`mb-4 w-80 h-96 flex flex-col rounded-lg shadow-lg border overflow-hidden transition-all duration-300 
      ${isDarkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-900 border-gray-300"}`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
        <h4 className="text-lg font-semibold">{orgName} Chat</h4>
        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => setShowConfirm(true)}
                className="p-1 hover:text-red-500 transition-colors"
                title="Clear chat history"
              >
                <FaTrash className="w-5 h-5" />
              </button>
              {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <p className="mb-4">Are you sure you want to clear all chat history?</p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleClearChat}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {user?.role === 'admin' && toggle && (
            <button
              onClick={toggle}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isDarkMode
                  ? "bg-gray-600 hover:bg-gray-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Switch to Bot
            </button>
          )}
          <button onClick={onClose} className="text-2xl">
            <AiOutlineClose />
          </button>
        </div>
      </div>
  
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
              isDarkMode ? 'border-gray-200' : 'border-gray-800'
            }`} />
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isCurrentUser = msg.sender._id === user?.id;
              const isOnline = !!onlineUsers[msg.sender._id];
              return (
                <div
                  key={msg._id}
                  className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3 mb-4`}
                >
                  <div className="w-10 h-10 shrink-0 relative">
                    {msg.sender.profileImageUrl ? (
                      <img
                        src={msg.sender.profileImageUrl}
                        alt={msg.sender.name}
                        className="w-full h-full object-cover rounded-full border"
                      />
                    ) : (
                      <div className={`w-full h-full rounded-full flex items-center justify-center border 
                          ${isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-gray-300 border-gray-400 text-gray-800'}`}>
                        {msg.sender.name[0]}
                      </div>
                    )}
                    <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  </div>
                  <div className="flex flex-col max-w-[80%]">
                    <span className="text-xs font-medium mb-1">
                      {isCurrentUser ? 'You' : msg.sender.name}
                    </span>
                    <div className={`px-4 py-2 rounded-lg text-xs shadow-sm
                      ${isCurrentUser
                        ? (isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                        : (isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900")}`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] mt-1 self-end text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
  
      {/* Message Input */}
      <form onSubmit={handleSubmit} className={`flex gap-2 p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || isSending}
          className={`flex-1 p-2 text-sm rounded-lg focus:outline-none ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900"}`}
        />
        <button
          type="submit"
          disabled={isLoading || isSending}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
            ${isDarkMode 
              ? "bg-blue-600 hover:bg-blue-500 text-white" 
              : "bg-blue-500 hover:bg-blue-400 text-white"
            }
            ${isSending ? 'opacity-70 cursor-not-allowed' : ''}
            flex items-center gap-2
          `}
        >
          {isSending ? (
            <>
              <div className={`animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 ${
                isDarkMode ? 'border-white' : 'border-gray-800'
              }`} />
              Sending...
            </>
          ) : (
            'Send'
          )}
        </button>
      </form>
    </div>
  );
};

export default Chat;


