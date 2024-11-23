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
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching announcements:', error);
        return;
      }

      const lastReadTime = localStorage.getItem('lastReadAnnouncement');
      // Add seen status to each announcement
      const processedData = (data || []).map(announcement => ({
        ...announcement,
        seen: lastReadTime ? new Date(announcement.created_at) <= new Date(lastReadTime) : false
      }));

      setAnnouncements(processedData);
      
      // Calculate unread count
      if (lastReadTime && data) {
        const unreadAnnouncements = data.filter(
          announcement => new Date(announcement.created_at) > new Date(lastReadTime)
        );
        setUnreadCount(unreadAnnouncements.length);
      } else if (data) {
        setUnreadCount(data.length);
      }
    };

    fetchAnnouncements();

    // Subscribe to both INSERT and DELETE changes
    const channel = supabase
      .channel('announcements-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'announcements' },
        (payload) => {
          setAnnouncements(current => [payload.new, ...current].slice(0, 5));
          setUnreadCount(count => count + 1);
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'announcements' },
        () => {
          // Refetch announcements when one is deleted
          fetchAnnouncements();
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