/* eslint-disable @typescript-eslint/no-explicit-any */

import { stripe } from '../lib/stripe';

/**
 * This is a simple node script to verify that the Stripe SDK is correctly 
 * initialized and can communicate with the Stripe API.
 * * Run with: npx ts-node tests/stripe-integration.test.ts
 */

async function testStripeConnection() {
  console.log("--- Starting Stripe Integration Test ---");
  
  try {
    console.log("1. Testing API Key validity...");
    const balance = await stripe.balance.retrieve();
    console.log("✅ Success: Stripe connection established.");
    console.log(`Current Balance Status: ${balance.available[0].amount} ${balance.available[0].currency.toUpperCase()}`);

    console.log("\n2. Testing Product Creation (Preview)...");
    // We won't actually create a product, but we'll list existing ones to check read permissions
    const products = await stripe.products.list({ limit: 1 });
    console.log(`✅ Success: Found ${products.data.length} existing products.`);

    console.log("\n--- Test Suite Completed Successfully ---");
  } catch (error: any) {
    console.error("\n❌ Test Failed!");
    console.error("Error Message:", error.message);
    if (error.message.includes("api_key")) {
      console.error("Suggestion: Check your STRIPE_SECRET_KEY in .env.local");
    }
    process.exit(1);
  }
}

testStripeConnection();