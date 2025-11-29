import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { demoSignals } from '@/lib/demo-signals';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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

    if (!user_id || !lat || !lng || !intent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const signalId = `signal_${Date.now()}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + duration_minutes * 60000).toISOString();

    let photo_url = photo_base64 || `https://via.placeholder.com/200?text=${encodeURIComponent(intent)}`;

    // Try to upload to Supabase if configured
    if (supabase && photo_base64 && photo_base64.includes('data:image')) {
      try {
        const buffer = Buffer.from(photo_base64.split(',')[1] || photo_base64, 'base64');
        const fileName = `${user_id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, buffer, { contentType: 'image/jpeg' });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            photo_url = publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Could not upload to Supabase, using data URL:', err);
      }
    }

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
      expires_at: expiresAt,
      is_active: true,
      created_at: createdAt,
    };

    // Try to insert to Supabase if configured
    if (supabase) {
      try {
        await supabase.from('signals').insert([signal]);
      } catch (err) {
        console.warn('Could not insert to Supabase, using demo mode:', err);
        demoSignals.push(signal);
      }
    } else {
      demoSignals.push(signal);
    }

    return NextResponse.json({ signal }, { status: 201 });
  } catch (error) {
    console.error('Error creating signal:', error);
    return NextResponse.json(
      { error: 'Failed to create signal' },
      { status: 500 }
    );
  }
}
