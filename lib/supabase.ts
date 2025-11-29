'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (url && key && url.startsWith('https://')) {
      supabaseClient = createClient(url, key);
    }
  }

  return supabaseClient;
}

// For backward compatibility - export a proxy object
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    const client = getSupabase();
    if (!client) {
      return (...args: any[]) => {
        console.warn('Supabase not configured. Using demo mode.');
        if (prop === 'auth') {
          return {
            signInAnonymously: async () => ({ 
              data: { user: { id: 'demo-user' } }, 
              error: null 
            }),
          };
        }
        return null;
      };
    }
    return (client as any)[prop];
  },
});

export type Signal = {
  id: string;
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  intent: string;
  photo_url: string;
  messenger: 'telegram' | 'whatsapp' | 'viber';
  contact_info: string;
  gender: string;
  has_place: boolean;
  expires_at: string;
  is_active: boolean;
  created_at: string;
};

export type User = {
  id: string;
  phone?: string;
  created_at: string;
};
