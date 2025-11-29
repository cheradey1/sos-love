import { NextRequest, NextResponse } from 'next/server';
import { getDemoSignals } from '@/lib/demo-signals';

export async function POST(request: NextRequest) {
  try {
    const { signal_id } = await request.json();

    if (!signal_id) {
      return NextResponse.json(
        { error: 'signal_id is required' },
        { status: 400 }
      );
    }

    // In demo mode, we remove from the in-memory store
    const signals = getDemoSignals() as any[];
    const index = signals.findIndex((s: any) => s.id === signal_id);
    
    if (index > -1) {
      signals.splice(index, 1);
    }

    return NextResponse.json({ success: true, message: 'Signal deleted' });
  } catch (error) {
    console.error('Error deleting signal:', error);
    return NextResponse.json(
      { error: 'Failed to delete signal' },
      { status: 500 }
    );
  }
}
