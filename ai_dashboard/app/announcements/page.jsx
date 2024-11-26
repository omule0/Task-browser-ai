"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loading } from "@/components/ui/loading";
import { Card } from "@/components/ui/card";
import { useAnnouncements } from "@/components/AnnouncementsProvider";
import { MegaphoneIcon } from "lucide-react";

export default function Announcements() {
  const [loading, setLoading] = useState(true);
  const { announcements, markAsRead } = useAnnouncements();

  useEffect(() => {
    markAsRead();
    setLoading(false);
  }, [markAsRead]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Announcements</h1>
      {announcements.length === 0 ? (
        <Card className="p-12 bg-background">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <img src="/megaphone.png" className="h-12 w-12" alt="Megaphone" />
            <h3 className="font-semibold text-lg text-foreground">No announcements yet</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for updates and announcements.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="p-4 bg-background">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-medium text-foreground">{announcement.title}</h2>
                  <span className="text-xs text-muted-foreground">
                    {new Date(announcement.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{announcement.content}</p>
                {announcement.link && (
                  <a 
                    href={announcement.link} 
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
} 