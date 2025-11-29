import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const paddleApiKey = process.env.PADDLE_API_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Verify Paddle webhook signature
function verifyPaddleSignature(body: string, signature: string | undefined): boolean {
  if (!signature || !paddleApiKey) return false;

  const hash = crypto
    .createHmac('sha256', paddleApiKey)
    .update(body)
    .digest('hex');

  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('Paddle-Signature');

    // Verify webhook authenticity
    if (!verifyPaddleSignature(body, signature || '')) {
      console.warn('Invalid Paddle signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // Handle subscription events
    switch (type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = data;
        const passthrough = subscription.passthrough
          ? JSON.parse(subscription.passthrough)
          : {};

        await supabase.from('subscriptions').upsert([
          {
            id: subscription.id,
            user_id: passthrough.userId,
            paddle_customer_id: subscription.customer_id,
            paddle_subscription_id: subscription.id,
            tier: 'premium',
            status: subscription.status === 'active' ? 'active' : 'inactive',
            current_period_start: subscription.current_billing_period?.starts_at,
            current_period_end: subscription.current_billing_period?.ends_at,
            updated_at: new Date().toISOString(),
          },
        ]);

        console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
        break;
      }

      case 'subscription.canceled': {
        const subscription = data;
        await supabase.from('subscriptions').update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('paddle_subscription_id', subscription.id);

        console.log(`Subscription ${subscription.id} canceled`);
        break;
      }

      case 'transaction.completed': {
        const transaction = data;
        // Handle successful payment
        console.log(`Payment completed: ${transaction.id}`);
        break;
      }

      case 'transaction.billed': {
        const transaction = data;
        // Handle billing
        console.log(`Payment billed: ${transaction.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
