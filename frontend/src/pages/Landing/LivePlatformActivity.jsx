import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Network, Handshake, BriefcaseBusiness, BookOpen, Clock, Users, ArrowUpRight } from 'lucide-react';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:5000'; // Make sure this matches your backend URL
const API_URL = 'http://localhost:5000/api';

const getActivityIcon = (type) => {
  switch (type) {
    case 'mentorship': return <Handshake className="w-5 h-5 text-orange-600" />;
    case 'collaboration': return <Network className="w-5 h-5 text-purple-600" />;
    case 'career': return <BriefcaseBusiness className="w-5 h-5 text-green-600" />;
    case 'profile': return <BookOpen className="w-5 h-5 text-indigo-600" />;
    case 'community': return <Users className="w-5 h-5 text-blue-600" />;
    default: return <ArrowUpRight className="w-5 h-5 text-gray-600" />;
  }
};

const LivePlatformActivity = () => {
  const [activities, setActivities] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  // Fetch initial activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${API_URL}/activities/global`);
        setActivities(response.data);
      } catch (error) {
        console.error("Failed to fetch global activities:", error);
      }
    };
    fetchActivities();
  }, []);

  // Set up socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to activity socket');
    });

    socket.on('new_global_activity', (newActivity) => {
      setActivities((prev) => {
        const updated = [newActivity, ...prev];
        return updated.slice(0, 10); // Keep only latest 10
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Time formatter
  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "just now";
  };

  return (
    <section className="py-20 relative bg-gray-50 border-y border-gray-200/50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-semibold text-blue-700 tracking-wide uppercase">Live Feed</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Platform Activity</h2>
            <p className="text-gray-500 mt-2">Real-time updates from our thriving ecosystem</p>
          </div>
        </div>

        {/* Ticker Container */}
        <div 
          className="relative w-full h-[400px] rounded-3xl bg-white shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient masks for smooth scroll fading */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

          <div 
            className="absolute inset-x-0 p-6 flex flex-col gap-4 overflow-y-auto hide-scrollbar h-full"
            ref={scrollRef}
          >
            <AnimatePresence>
              {activities.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">Waiting for activities...</div>
              ) : (
                activities.map((activity) => (
                  <motion.div
                    key={activity._id}
                    layout
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-lg transition-all"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${activity.color || 'bg-gray-100'}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 truncate">
                          {activity.user ? activity.user.name : 'Someone'}
                        </span>
                        <span className="text-gray-500 truncate text-sm">
                          {activity.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(activity.createdAt)}
                      </div>
                    </div>

                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default LivePlatformActivity;
