import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { AiOutlineMessage, AiOutlineClose } from "react-icons/ai";
import { useThemeStore } from "../../store/themeStore";
import { useAuthStore } from '../../store/authStore';
import { useOrganizationStore } from '../../store/organizationStore';
import axiosInstance from '../../api/axiosInstance';

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    name: string;
    profileImageUrl?: string;
    pseudo_name: string;
  };
  timestamp: Date;
}

const BACKEND_URL = import.meta.env.VITE_API_SOCKET_URL;


const Chat = () => {
  const [open, setOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useThemeStore();
  const { user } = useAuthStore();
  const { orgName } = useOrganizationStore();

  useEffect(() => {
    if (open && orgName) {
     
      const fetchMessages = async () => {
        try {
          const response = await axiosInstance.get(`/messages?org=${orgName}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();

      // Initialize the socket connection and store it in the ref.
      const newSocket = io(BACKEND_URL, {
        auth: { token: localStorage.getItem('token') }
      });
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });
      newSocket.on('newMessage', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });
      socketRef.current = newSocket;

      // disconnect the socket on unmount or when dependencies change.
      return () => {
        newSocket.disconnect();
      };
    }
  }, [open, orgName]);

  useEffect(() => {
    // Scroll to the bottom each time messages change.
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !socketRef.current || !user) return;

    socketRef.current.emit('sendMessage', inputMessage);
    setInputMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className={`mb-4 w-80 h-96 flex flex-col rounded-lg shadow-lg border overflow-hidden transition-all duration-300 
          ${isDarkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-900 border-gray-300"}`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
            <h4 className="text-lg font-semibold">{orgName} Chat</h4>
            <button onClick={() => setOpen(false)} className="text-2xl">
              <AiOutlineClose />
            </button>
          </div>
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isCurrentUser = msg.sender._id === user?.id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}
                >
                  {/* Profile Image */}
                  <div className="w-10 h-10 shrink-0">
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
                  </div>
                  {/* Message Content */}
                  <div className="flex flex-col max-w-[80%]">
                    {/* Sender Name */}
                    <span className="text-xs font-medium mb-1">
                      {isCurrentUser ? 'You' : msg.sender.name}
                    </span>
                    {/* Message Bubble */}
                    <div className={`px-4 py-2 rounded-lg text-xs shadow-sm
                      ${isCurrentUser
                        ? (isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white")
                        : (isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900")}`}>
                      {msg.text}
                    </div>
                    {/* Timestamp */}
                    <span className="text-[9px] mt-1 self-end text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          {/* Message Input */}
          <form onSubmit={handleSubmit} className={`flex gap-2 p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
            <input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className={`flex-1 p-2 text-sm rounded-lg focus:outline-none ${isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-900"}`}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-400 text-white"}`}
            >
              Send
            </button>
          </form>
        </div>
      )}
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-300 border ${isDarkMode ? "bg-gray-800 text-gray-200 hover:bg-gray-700 border-gray-700" : "bg-white text-gray-900 hover:bg-gray-100 border-gray-300"}`}
      >
        {open ? <AiOutlineClose /> : <AiOutlineMessage />}
      </button>
    </div>
  );
};

export default Chat;
