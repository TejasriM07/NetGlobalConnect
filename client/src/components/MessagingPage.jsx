import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getConnections, getProfile } from "../api";
import ChatPage from "./ChatPage";
import { Users, MessageCircle, Search } from "lucide-react";
import defaultAvatar from "../assets/default.jpeg";

export default function MessagingPage() {
  const navigate = useNavigate();
  const { id: activeChatId } = useParams();
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [connectionsRes, profileRes] = await Promise.all([
          getConnections(),
          getProfile()
        ]);
        
        setConnections(connectionsRes.data.connections || connectionsRes.data.data || []);
        setMyProfile(profileRes.data?.data);
      } catch (err) {
        console.error("Failed to load messaging data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredConnections = connections.filter(conn =>
    conn.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartChat = (connectionId) => {
    navigate(`/chat/${connectionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading messaging...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left sidebar - Connections list */}
      <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-4">
            <MessageCircle className="text-blue-600" size={24} />
            Messages
          </h1>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Connections list */}
        <div className="flex-1 overflow-y-auto">
          {filteredConnections.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500 text-lg mb-2">No connections found</p>
              <p className="text-slate-400 text-sm">
                {searchTerm ? "Try a different search term" : "Connect with people to start messaging"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {filteredConnections.map((connection) => (
                <div
                  key={connection._id}
                  onClick={() => handleStartChat(connection._id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    activeChatId === connection._id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={connection.profilePic?.url || defaultAvatar}
                      alt={connection.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {connection.name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {connection.role || "User"}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MessageCircle 
                      size={16} 
                      className={activeChatId === connection._id ? "text-blue-600" : "text-slate-400"} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side - Chat or welcome message */}
      <div className="flex-1 flex flex-col">
        {activeChatId ? (
          <ChatPage />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-24 h-24 text-slate-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-700 mb-2">
                Welcome to Messages
              </h2>
              <p className="text-slate-500 max-w-md">
                Select a connection from the list to start a conversation. 
                Your messages are private and secure.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}