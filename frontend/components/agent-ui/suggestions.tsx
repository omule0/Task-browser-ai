// import { IconX, IconInfoCircle } from '@tabler/icons-react';
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
  // const [showDisclaimer, setShowDisclaimer] = useState(true);
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
    <div className="space-y-6 sm:space-y-8">
      {/* Centered Greeting Text */}
      <div className="text-center px-4 sm:px-0">
        {loading ? (
          <Skeleton className="h-8 sm:h-12 w-48 sm:w-64 mx-auto rounded-lg" />
        ) : (
          <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-foreground">
            Greetings, {getFirstName(profile?.full_name)}
          </h1>
        )}
      </div>

      {/* Sensitive Data Disclaimer */}
      {/* {showDisclaimer && (
        <div className="relative mx-4 sm:mx-0 rounded-lg border border-border bg-accent p-3 sm:p-4 shadow-sm">
          <div className="flex items-start gap-2 sm:gap-3">
            <IconInfoCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <h2 className="text-xs sm:text-sm font-medium text-foreground">
                Sensitive Data Disclaimer
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground break-words">
                Our agent doesn&apos;t need to see your sensitive or other highly confidential information (e.g.passwords and access keys) unless you want to share it with the agent.
              </p>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="flex-shrink-0 rounded-lg p-1 hover:bg-accent/70 -mt-1"
              aria-label="Close disclaimer"
            >
              <IconX className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
}; 