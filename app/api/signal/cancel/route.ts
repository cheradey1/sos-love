import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { signal_id } = await request.json();

    if (!signal_id) {
      return NextResponse.json(
        { error: 'Signal ID required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('signals')
      .update({ is_active: false })
      .eq('id', signal_id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to cancel signal' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
