import { IconX, IconInfoCircle } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export const Suggestions = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const getFirstName = (fullName: string | null | undefined) => {
    if (!fullName) return 'User';
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  return (
    <div className="space-y-8">
      {/* Centered Greeting Text */}
      <div className="text-center">
        {loading ? (
          <Skeleton className="h-12 w-64 mx-auto" />
        ) : (
          <h1 className="text-4xl font-light tracking-tight text-gray-800">
            Greetings, {getFirstName(profile?.full_name)}
          </h1>
        )}
      </div>

      {/* Sensitive Data Disclaimer */}
      {showDisclaimer && (
        <div className="relative rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <IconInfoCircle className="h-5 w-5 flex-shrink-0 text-gray-600" />
            <div className="flex-1">
              <h2 className="text-sm font-medium text-gray-900">
                Sensitive Data Disclaimer
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Our agent doesn&apos;t need to see your sensitive or other highly confidential information (e.g.passwords and access keys) unless you want to share it with the agent.
              </p>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="flex-shrink-0 rounded-lg p-1 hover:bg-gray-50"
              aria-label="Close disclaimer"
            >
              <IconX className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 