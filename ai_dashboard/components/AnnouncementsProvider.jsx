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

      setAnnouncements(data || []);
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