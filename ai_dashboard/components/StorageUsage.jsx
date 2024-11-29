"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { cn } from "@/lib/utils";

export function StorageUsage({ refresh }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUsage = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // First, ensure the user has a storage_usage record
      const { error: upsertError } = await supabase
        .from('storage_usage')
        .upsert({ 
          user_id: user.id,
          bytes_used: 0,
          storage_limit: 52428800 
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: true 
        });

      if (upsertError) console.error('Error upserting storage usage:', upsertError);

      // Then get the current usage
      const { data, error } = await supabase
        .from('storage_usage')
        .select('bytes_used, storage_limit')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Subscribe to realtime changes
      const channel = supabase
        .channel('storage_usage_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'storage_usage',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setUsage(payload.new);
        })
        .subscribe();

      setUsage(data);

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error loading storage usage:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, [refresh]);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const usagePercent = (usage.bytes_used / usage.storage_limit) * 100;
  const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  const getProgressColorClass = () => {
    if (usagePercent > 90) return "bg-red-500";
    if (usagePercent > 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-muted-foreground">Storage Used</span>
        <span className="text-sm text-muted-foreground">
          {formatBytes(usage.bytes_used)} / {formatBytes(usage.storage_limit)}
        </span>
      </div>
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", getProgressColorClass())}
          style={{ width: `${Math.min(usagePercent, 100)}%` }}
        />
      </div>
      {usagePercent > 90 && (
        <p className="text-xs text-destructive mt-1">
          Storage almost full! Please delete some files.
        </p>
      )}
    </div>
  );
} 