/* eslint-disable @typescript-eslint/no-explicit-any */
/** File Path: ./centenarian-academy/app/api/webhooks/stripe/route.ts */

import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/supabase';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Stripe Webhook Route
 * This endpoint is called by Stripe after a payment event occurs.
 * It is the source of truth for granting 'Paid' access.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = getAdminClient();

  // Handle the specific event: checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error('Stripe Webhook: No userId found in session metadata');
      return new NextResponse('No userId in metadata', { status: 400 });
    }

    try {
      // 1. Log the payment details
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_customer_id: session.customer as string,
          amount_total: session.amount_total,
          currency: session.currency,
          status: 'complete',
        });

      if (paymentError) throw paymentError;

      // 2. Note: The database trigger we created (on_payment_complete)
      // will automatically set profiles.is_paid = TRUE.
      
      console.log(`Successfully processed payment for User: ${userId}`);
    } catch (dbError) {
      console.error('Database Error during webhook:', dbError);
      return new NextResponse('Database Sync Failed', { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}