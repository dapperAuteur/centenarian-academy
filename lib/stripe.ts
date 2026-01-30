/** File Path: ./centenarian-academy/lib/stripe.ts */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

/**
 * Initialize the Stripe SDK for server-side operations.
 * We use the latest API version.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16.clover', // Or the latest stable version
  typescript: true,
});