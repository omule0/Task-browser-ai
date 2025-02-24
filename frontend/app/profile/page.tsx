'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createClient } from '@/utils/supabase/client';
import { LoadingAnimation } from '@/components/agent-ui';
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setEditForm(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile information.",
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, router, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev!, ...editForm }));
      setEditing(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile information.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-4">Please log in to view your profile</p>
          <Button onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 mt-16">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <IconEdit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setEditForm(profile);
                }}
              >
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
              >
                <IconCheck className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            {editing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={editForm.full_name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  {profile.avatar_url && (
                    <Image
                      src={profile.avatar_url}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{profile.full_name || 'No name set'}</h2>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 