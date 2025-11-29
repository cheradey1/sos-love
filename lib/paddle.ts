// Paddle SDK initialization and pricing
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    period: 'forever',
    currency: 'USD',
    features: [
      '✅ Create signals',
      '✅ Up to 5 active signals',
      '✅ Basic map view',
      '❌ Premium categories',
      '❌ Analytics',
    ],
  },
  premium_monthly: {
    name: 'Premium',
    price: 5,
    period: 'month',
    currency: 'USD',
    features: [
      '✅ All from Free',
      '✅ Up to 50 active signals',
      '✅ Advanced map filters',
      '✅ Premium categories',
      '✅ View analytics',
      '✅ Priority support',
    ],
    // Create product in Paddle dashboard and get this ID
    paddleProductId: 'pri_01234567890abcdef', // Replace with actual Paddle Product ID
  },
  premium_yearly: {
    name: 'Premium (1 Year)',
    price: 50,
    period: 'year',
    currency: 'USD',
    features: [
      '✅ All Premium features',
      '✅ Save 16% vs monthly',
    ],
    paddleProductId: 'pri_01234567890abcdef', // Replace with actual Paddle Product ID
  },
};

export type SubscriptionTier = 'free' | 'premium';

export interface UserSubscription {
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'canceled';
  subscriptionId?: string;
  customerId?: string;
  nextBillingDate?: string;
  createdAt: string;
  expiresAt?: string;
}

// Initialize Paddle in browser
export async function initPaddleCheckout() {
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!clientToken) {
    console.error('Paddle client token not found');
    return null;
  }

  try {
    const { Paddle } = await import('@paddle/paddle-js');
    
    Paddle.Setup({
      seller: parseInt(process.env.NEXT_PUBLIC_PADDLE_SELLER_ID || '268578'),
      client: clientToken,
      environment: 'production',
    });

    return Paddle;
  } catch (error) {
    console.error('Failed to initialize Paddle:', error);
    return null;
  }
}

// Open Paddle checkout
export async function openCheckout(priceId: string, userId: string, email: string) {
  try {
    const { Paddle } = await import('@paddle/paddle-js');
    
    if (!Paddle) {
      await initPaddleCheckout();
    }

    Paddle.Checkout.open({
      items: [{ priceId }],
      customer: {
        email,
      },
      passthrough: JSON.stringify({ userId }),
      successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
    });
  } catch (error) {
    console.error('Failed to open checkout:', error);
    throw error;
  }
}
