import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { addDemoSignal } from '@/lib/demo-signals';

export async function POST(request: NextRequest) {
  try {
    const {
      user_id,
      name,
      lat,
      lng,
      intent,
      photo_base64,
      messenger,
      contact_info,
      gender,
      has_place,
      duration_minutes,
    } = await request.json();

    // Validation
    if (!user_id || lat === undefined || lng === undefined || !intent || !messenger || !contact_info) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate signal ID
    const signalId = `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    const expires_at = new Date(Date.now() + (duration_minutes || 30) * 60000).toISOString();

    // For demo mode - use photo_base64 directly as data URL or placeholder
    let photo_url = photo_base64 || `https://via.placeholder.com/200?text=${encodeURIComponent(intent)}`;

    // Create signal object
    const signal = {
      id: signalId,
      user_id,
      name,
      lat,
      lng,
      intent,
      photo_url,
      messenger,
      contact_info,
      gender,
      has_place: has_place || false,
      expires_at,
      is_active: true,
      created_at: createdAt,
    };

    // Try to upload to Supabase if configured
    if (photo_base64 && photo_base64.includes('data:image')) {
      try {
        const buffer = Buffer.from(photo_base64.split(',')[1] || photo_base64, 'base64');
        const fileName = `${user_id}-${Date.now()}.jpg`;

        const supabaseTyped = supabase as Record<string, unknown>;
        if (typeof supabaseTyped.storage === 'object') {
          const storage = supabaseTyped.storage as Record<string, unknown>;
          if (typeof storage.from === 'function') {
            const { error: uploadError } = await (storage.from as (bucket: string) => {
              upload: (name: string, file: Buffer, options: Record<string, string>) => Promise<{ error: any }>;
              getPublicUrl: (name: string) => Promise<{ data: { publicUrl: string } }>;
            })('photos')
              .upload(fileName, buffer, { contentType: 'image/jpeg' });

            if (!uploadError) {
              const { data: publicUrlData } = await (storage.from as (bucket: string) => {
                upload: (name: string, file: Buffer, options: Record<string, string>) => Promise<{ error: any }>;
                getPublicUrl: (name: string) => Promise<{ data: { publicUrl: string } }>;
              })('photos')
                .getPublicUrl(fileName);

              if (publicUrlData?.publicUrl) {
                signal.photo_url = publicUrlData.publicUrl;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not upload to Supabase, using data URL:', err);
        // Keep photo_base64 as is
      }
    }

    // Try to insert to Supabase if configured
    try {
      const supabaseTyped = supabase as Record<string, unknown>;
      if (typeof supabaseTyped.from === 'function') {
        const { data, error } = await (supabaseTyped.from as (table: string) => {
          insert: (obj: any) => {
            select: () => { single: () => Promise<{ data: any; error: any }> };
          };
        })('signals')
          .insert(signal)
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ signal: data }, { status: 201 });
        }
      }
    } catch (err) {
      console.warn('Could not insert to Supabase:', err);
    }

    // Store in demo mode
    addDemoSignal(signal);

    return NextResponse.json({ signal }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
