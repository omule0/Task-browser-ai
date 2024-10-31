import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        
        <div className="space-y-4">
          {/* Profile Avatar */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">
                {user.user_metadata.full_name?.[0] || user.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.user_metadata.full_name || 'No name set'}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Profile Information */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1">{user.email}</p>
              </div>
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="mt-1">{user.user_metadata.full_name || 'Not set'}</p>
              </div>
              <div className="border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-600">Account Created</label>
                <p className="mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8">
            <button className="bg-purple-900 text-white px-4 py-2 rounded-md hover:bg-purple-800">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 