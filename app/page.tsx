'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Signal } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🔥</div>
        <p className="text-lg font-semibold">Loading SOSNU...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);

  // Demo signals for testing - DISABLED by default
  const getDemoSignals = (): Signal[] => {
    // Return empty array - only show real signals or nothing
    return [];
    /*
    // Uncomment to enable demo mode with sample data
    return [
      {
        id: 'demo-1',
        user_id: 'demo-user',
        lat: 50.45,
        lng: 30.53,
        intent: 'Coffee',
        photo_url: 'https://via.placeholder.com/200?text=Coffee+Date',
        messenger: 'telegram',
        contact_info: '@demousername',
        gender: 'female',
        has_place: true,
        expires_at: new Date(Date.now() + 3600000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo-2',
        user_id: 'demo-user-2',
        lat: 50.43,
        lng: 30.55,
        intent: 'Walk',
        photo_url: 'https://via.placeholder.com/200?text=Walk+Buddy',
        messenger: 'whatsapp',
        contact_info: '+380123456789',
        gender: 'male',
        has_place: false,
        expires_at: new Date(Date.now() + 1800000).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
    */
  };

  // Fetch signals from Supabase or local storage
  const fetchSignals = useCallback(async () => {
    try {
      // Try to fetch from API first (works with demo mode)
      const response = await fetch('/api/signals');
      if (response.ok) {
        const data = await response.json();
        setSignals(data.signals || []);
        return;
      }
    } catch (error) {
      console.warn('Error fetching from API:', error);
    }

    // Fallback: Try Supabase
    try {
      if (!supabase || typeof supabase !== 'object') {
        console.warn('Supabase not configured. Running in demo mode.');
        setSignals(getDemoSignals());
        return;
      }

      const supabaseTyped = supabase as Record<string, unknown>;
      
      if (typeof supabaseTyped.from !== 'function') {
        console.warn('Supabase not configured. Running in demo mode.');
        setSignals(getDemoSignals());
        return;
      }

      const result = await (supabaseTyped.from as (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: boolean) => {
            gt: (col: string, val: string) => Promise<{ data: Signal[] | null }>;
          };
        };
      })('signals')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString());

      if (result?.data) {
        setSignals(result.data);
      } else {
        setSignals(getDemoSignals());
      }
    } catch (error) {
      console.warn('Error fetching from Supabase, using demo mode:', error);
      setSignals(getDemoSignals());
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      void fetchSignals();
    }

    // Refresh signals every 5 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        void fetchSignals();
      }
    }, 5000);

    // Subscribe to real-time updates
    try {
      const result = supabase as unknown as {
        channel?: (name: string) => {
          on: (event: string, config: Record<string, unknown>, callback: () => void) => {
            subscribe: () => { unsubscribe: () => void };
          };
        };
      } | null;

      if (result && typeof result.channel === 'function') {
        const channel = result
          .channel('public:signals')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'signals' },
            () => {
              if (isMounted) {
                fetchSignals();
              }
            }
          )
          .subscribe();

        return () => {
          isMounted = false;
          clearInterval(interval);
          channel?.unsubscribe();
        };
      } else {
        return () => {
          isMounted = false;
          clearInterval(interval);
        };
      }
    } catch (error) {
      console.error('Error setting up realtime:', error);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [fetchSignals]);

  // Avoid hydration mismatch by rendering map component with refresh callback
  return <MapComponent signals={signals} onSignalCreated={fetchSignals} />;
}
