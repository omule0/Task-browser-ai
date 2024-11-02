"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Upload, Camera, Trash2 } from "lucide-react";
import { toast } from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    const supabase = createClient();
    
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFormData({
          full_name: user.user_metadata.full_name || "",
          email: user.email || "",
        });
        if (user.user_metadata.avatar_url) {
          setAvatarUrl(user.user_metadata.avatar_url);
        }
      }
      setLoading(false);
    }

    getUser();
  }, []);

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      const supabase = createClient();
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Profile picture updated successfully');
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading profile picture');
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    try {
      setUploading(true);
      const supabase = createClient();

      // Get the file path from the avatar URL
      const urlPath = avatarUrl.split('/').slice(-2).join('/');

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([urlPath]);

      if (deleteError) throw deleteError;

      // Update user metadata to remove avatar_url
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      if (updateError) throw updateError;

      setAvatarUrl(null);
      toast.success('Profile picture removed successfully');
      
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error('Error removing profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.full_name }
      });

      if (error) throw error;
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        user_metadata: { ...prev.user_metadata, full_name: formData.full_name }
      }));

      // Show success toast
      toast.success('Profile updated successfully', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error toast
      toast.error('Failed to update profile', {
        duration: 3000,
        position: 'top-center',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-56px)]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">

      <div>
        <h1 className="text-2xl font-semibold mb-2">Profile Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* Profile Picture Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 text-4xl">
                  {formData.full_name?.[0]?.toUpperCase() || formData.email[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 text-white p-2 rounded-full 
                  shadow-lg hover:bg-purple-700 transition-colors"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
              {avatarUrl && (
                <button
                  onClick={deleteAvatar}
                  className="bg-red-600 text-white p-2 rounded-full 
                    shadow-lg hover:bg-red-700 transition-colors"
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={uploadAvatar}
            accept="image/*"
            className="hidden"
          />
          <p className="text-sm text-gray-500 mt-2">
            {avatarUrl 
              ? "Click the camera icon to change or trash icon to remove"
              : "Click the camera icon to upload a profile picture"
            }
          </p>
        </div>

        {/* Existing Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="full_name">
              Full Name
            </label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-gray-50 border-gray-200"
            />
            <p className="text-sm text-gray-500">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-purple-600 hover:bg-purple-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
