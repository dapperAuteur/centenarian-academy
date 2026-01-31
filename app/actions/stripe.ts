'use server'

import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Creates a Stripe Checkout Session for the $100 CPT Academy Access.
 * funnels the user to the Stripe-hosted payment page.
 */
export async function createCheckoutSession() {
  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // If not logged in, redirect to login (or return error for UI to handle)
    return { error: 'Please sign in to purchase the Academy access.' };
  }

  const origin = (await headers()).get('origin');

  try {
    // 2. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Centenarian Athlete Academy: Full CPT Access',
              description: 'Lifelong access to the non-linear CPT curriculum, study guides, and flashcards.',
              images: ['https://your-domain.com/logo.png'], // Add your logo URL here
            },
            unit_amount: 10000, // $100.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
      metadata: {
        userId: user.id, // Critical for the webhook to identify who paid
      },
    });

    if (!session.url) {
      throw new Error('Failed to create stripe session url');
    }

    // 3. Redirect the user to Stripe Checkout
    redirect(session.url);

  } catch (err) {
    console.error('Stripe Session Error:', err);
    return { error: 'Payment gateway is currently unavailable. Please try again later.' };
  }
}