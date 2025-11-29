import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Signal } from '@/lib/supabase';
import { getDemoSignals, clearExpiredSignals } from '@/lib/demo-signals';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '5000'; // default 5km

    let signals: Signal[] = [];

    // Clear expired signals first
    clearExpiredSignals();

    // Try to fetch from Supabase first
    try {
      const supabaseTyped = supabase as Record<string, unknown>;
      if (typeof supabaseTyped.from === 'function') {
        const result = await (supabaseTyped.from as (table: string) => {
          select: (cols: string) => {
            eq: (col: string, val: boolean) => {
              gt: (col: string, val: string) => Promise<{ data: Signal[] | null; error: any }>;
            };
          };
        })('signals')
          .select('*')
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString());

        if (result?.data) {
          signals = result.data;
        }
      }
    } catch (error) {
      console.warn('Could not fetch from Supabase, using demo mode:', error);
    }

    // If no signals from Supabase, use demo signals
    if (signals.length === 0) {
      signals = getDemoSignals() as Signal[];
    }

    // If lat/lng provided, filter by distance (client-side for MVP)
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusMeters = parseInt(radius);

      const filtered = signals.filter((signal: Signal) => {
        const distance = calculateDistance(userLat, userLng, signal.lat, signal.lng);
        return distance <= radiusMeters;
      });

      return NextResponse.json({ signals: filtered });
    }

    return NextResponse.json({ signals });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', signals: [] },
      { status: 500 }
    );
  }
}

  // Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
}
