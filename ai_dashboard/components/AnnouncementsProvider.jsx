"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const AnnouncementsContext = createContext({
  announcements: [],
  unreadCount: 0,
  markAsRead: () => {},
});

export function AnnouncementsProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchAnnouncements = async () => {
      // Get the last read timestamp from localStorage
      const lastRead = localStorage.getItem('lastReadAnnouncement') || '1970-01-01';
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching announcements:', error);
        return;
      }

      setAnnouncements(data);
      
      // Count unread announcements
      const unread = data.filter(
        announcement => new Date(announcement.created_at) > new Date(lastRead)
      ).length;
      setUnreadCount(unread);
    };

    fetchAnnouncements();

    // Subscribe to new announcements
    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          setAnnouncements(current => [payload.new, ...current].slice(0, 5));
          setUnreadCount(count => count + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = () => {
    localStorage.setItem('lastReadAnnouncement', new Date().toISOString());
    setUnreadCount(0);
  };

  return (
    <AnnouncementsContext.Provider value={{ announcements, unreadCount, markAsRead }}>
      {children}
    </AnnouncementsContext.Provider>
  );
}

export const useAnnouncements = () => useContext(AnnouncementsContext); 