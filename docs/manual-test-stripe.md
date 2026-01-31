# **Manual Testing Guide: Stripe & Content Gating**

**Before moving on to the Gemini AI integration, follow these steps to ensure the payment and security logic is working correctly.**

## **1\. Setup Stripe CLI**

**Download the [Stripe CLI](https://stripe.com/docs/stripe-cli) and login:**

```

stripe login

```

## **2\. Forward Webhooks**

**Open a terminal and start forwarding events to your local server:**

```

stripe listen --forward-to localhost:3000/api/webhooks/stripe

```

*   
  **Note: Copy the "webhook signing secret" (starts with whsec\_) and add it to your .env.local as STRIPE\_WEBHOOK\_SECRET.**

## **3\. Test the Checkout Flow**

1. **Launch your app: npm run dev.**  
2. **Login as a test user.**  
3. **Trigger the createCheckoutSession action (you can add a "Buy Now" button to the landing page temporarily).**  
4. **Enter [Stripe Test Card Details](https://www.google.com/search?q=https://stripe.com/docs/testing%23cards).**  
5. **After completion, Stripe will redirect you to your success URL.**

## **4\. Verify the Webhook**

**Check your stripe listen terminal. You should see a checkout.session.completed event.**

## **5\. Verify the Database (The Gold Standard)**

**Open your Supabase SQL Editor or Table Editor:**

1. **Check the payments table. There should be a new row with your userId.**  
2. **Check the profiles table for your userId. The is\_paid column should now be TRUE.**

## **6\. Verify Content Access**

1. **Try to access a "Premium" video (non-opener).**  
2. **If is\_paid is true, the getAuthorizedVideoUrl action should now return a valid Signed URL instead of "Access Denied."**

**Once these 6 steps pass, you are ready for Phase 3: AI & Semantic Intelligence.**

