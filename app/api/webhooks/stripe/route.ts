/* eslint-disable @typescript-eslint/no-explicit-any */
/** File Path: ./centenarian-academy/app/api/webhooks/stripe/route.ts */

import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/supabase';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

/**
 * Stripe Webhook Route
 * Handles both "Snapshot" (V1) and "Thin" (V2) payload styles.
 * Validates against multiple signing secrets (Snapshot and Thin).
 */
export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get('stripe-signature') as string;

  // Define our available secrets
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET_SNAPSHOT,
    process.env.STRIPE_WEBHOOK_SECRET_THIN,
  ].filter(Boolean) as string[];

  let event: Stripe.Event | null = null;
  let lastError: Error | null = null;

  // Attempt to verify the signature with each available secret
  for (const secret of secrets) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret);
      if (event) break; // If successful, stop checking
    } catch (err: any) {
      lastError = err;
      continue; // Try the next secret
    }
  }

  if (!event) {
    console.error(`Webhook signature verification failed for all secrets. Last error: ${lastError?.message}`);
    return new NextResponse(`Webhook Error: Unverifiable signature`, { status: 400 });
  }

  const supabase = getAdminClient();

  // Process the event based on its type and payload style
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      let session;

      // Check if this is a "Snapshot" payload (V1) or "Thin" payload (V2)
      if (event.data && event.data.object) {
        // V1: Full object is included
        session = event.data.object as any;
      } else {
        // V2 (Thin): Fetch the full session to get metadata
        console.log(`Processing Thin Payload for event: ${event.id}`);
        session = await stripe.checkout.sessions.retrieve((event.data as any).object.id);
      }

      const userId = session?.metadata?.userId;

      if (!userId) {
        console.error('Webhook Error: No userId found in session metadata');
        return new NextResponse('Missing metadata', { status: 400 });
      }

      try {
        // Log the payment - This triggers the DB trigger to unlock access
        const { error } = await supabase
          .from('payments')
          .insert({
            user_id: userId,
            stripe_session_id: session.id,
            stripe_customer_id: session.customer as string,
            amount_total: session.amount_total,
            currency: session.currency,
            status: 'complete',
          });

        if (error) throw error;
        console.log(`Payment processed for user: ${userId}`);
      } catch (dbError) {
        console.error('Database Sync Error:', dbError);
        return new NextResponse('Internal Server Error', { status: 500 });
      }
      break;
    }

    case 'charge.refunded': {
      let charge;
      if (event.data && event.data.object) {
        charge = event.data.object as any;
      } else {
        charge = await stripe.charges.retrieve((event.data as any).object.id);
      }

      // Handle Revoking Access
      const { data: payment } = await supabase
        .from('payments')
        .select('user_id')
        .eq('stripe_session_id', charge.payment_intent || charge.id)
        .maybeSingle();

      if (payment) {
        await supabase.from('profiles').update({ is_paid: false }).eq('id', payment.user_id);
        console.log(`Access revoked for refunded user: ${payment.user_id}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}