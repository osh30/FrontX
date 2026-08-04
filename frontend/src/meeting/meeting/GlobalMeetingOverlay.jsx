import React, { useState, useEffect } from 'react';
import MeetingPage from './MeetingPage';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

const GlobalMeetingOverlay = () => {
  const [meetingData, setMeetingData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleOpenMeeting = (e) => {
      if (e.detail && e.detail.roomId) {
        setMeetingData({
          roomId: e.detail.roomId,
          token: e.detail.token,
          serverUrl: e.detail.serverUrl
        });
      }
    };

    window.addEventListener('open-live-meeting', handleOpenMeeting);
    return () => window.removeEventListener('open-live-meeting', handleOpenMeeting);
  }, []);

  if (!meetingData) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black w-full h-full">
      <button 
        onClick={() => setMeetingData(null)}
        className="absolute top-4 right-4 z-[10000] p-2 bg-gray-800 hover:bg-red-600 text-white rounded-full transition-colors"
        title="Leave Meeting"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="w-full h-full relative">
        <MeetingPage 
          key={meetingData.token}
          roomName={meetingData.roomId} 
          token={meetingData.token} 
          serverUrl={meetingData.serverUrl} 
          userName={user?.name || ''} 
          autoJoin={true} 
        />
      </div>
    </div>
  );
};

export default GlobalMeetingOverlay;
