'use client'
import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/loading';

export default function MaintenancePage() {
  const [maintenanceMode, setMaintenanceMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      const { data } = await supabase
        .from('system_status')
        .select('maintenance_mode')
        .single();
      
      setMaintenanceMode(data?.maintenance_mode || false);
      setLoading(false);
    };

    fetchMaintenanceStatus();
  }, []);

  if (loading) {
    return <Loading/>
  }

  if (!maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-4xl font-bold text-foreground">System is Online</h1>
          <div className="my-8">
            <span className="text-6xl">✅</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            The system is now back online and ready to use.
          </p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/')}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <style jsx>{`
          @keyframes glitch {
            0% {
              transform: translate(0);
              text-shadow: -2px 0 red, 2px 2px #0ff;
            }
            25% {
              transform: translate(-2px, 2px);
              text-shadow: 2px -2px red, -2px -2px #0ff;
            }
            50% {
              transform: translate(2px, -2px);
              text-shadow: 2px 0 red, -2px 2px #0ff;
            }
            75% {
              transform: translate(-2px, 2px);
              text-shadow: -2px -2px red, 2px -2px #0ff;
            }
            100% {
              transform: translate(0);
              text-shadow: -2px 0 red, 2px 2px #0ff;
            }
          }
          
          .glitch {
            position: relative;
            animation: glitch 3s infinite;
          }

          .glitch::before,
          .glitch::after {
            content: "System Maintenance";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }

          .glitch::before {
            left: 2px;
            text-shadow: -2px 0 red;
            animation: glitch-anim 2s infinite linear alternate-reverse;
          }

          .glitch::after {
            left: -2px;
            text-shadow: 2px 0 #0ff;
            animation: glitch-anim 3s infinite linear alternate-reverse;
          }

          @keyframes glitch-anim {
            0% {
              clip-path: inset(71% 0 10% 0);
            }
            20% {
              clip-path: inset(29% 0 71% 0);
            }
            40% {
              clip-path: inset(94% 0 3% 0);
            }
            60% {
              clip-path: inset(48% 0 47% 0);
            }
            80% {
              clip-path: inset(17% 0 75% 0);
            }
            100% {
              clip-path: inset(83% 0 16% 0);
            }
          }

          .maintenance-icon {
            display: inline-block;
            animation: bounce-glitch 2s infinite;
          }

          @keyframes bounce-glitch {
            0%, 100% {
              transform: translateY(0);
              filter: none;
            }
            50% {
              transform: translateY(-20px);
              filter: drop-shadow(0 0 5px red) drop-shadow(0 0 10px #0ff);
            }
            25%, 75% {
              filter: drop-shadow(2px 0 red) drop-shadow(-2px 0 #0ff);
            }
          }
        `}</style>
        <h1 className="text-4xl font-bold text-foreground glitch">System Maintenance</h1>
        <div className="maintenance-icon my-8">
          <span className="text-6xl">🔧</span>
        </div>
        <p className="text-xl text-muted-foreground max-w-md mx-auto relative overflow-hidden">
          We're currently performing system maintenance to improve your experience.
          <span className="block mt-2 font-mono text-sm opacity-75" style={{
            animation: 'glitch 2s steps(100) infinite'
          }}>
            Please check back soon...
          </span>
        </p>
      </div>
    </div>
  );
}