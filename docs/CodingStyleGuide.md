# **Coding Style Guide: Centenarian Academy**

## **1\. Stack Conventions**

* **Framework:** Next.js 14 App Router.  
* **Language:** Strict TypeScript.  
* **Data Fetching:** Prefer Server Components with direct Supabase calls for initial load; use Client Components for interactive "Adventure" logic.

## **2\. File Structure**

* app/: Routes and Server Components.  
* components/: UI components (Atomic design: ui/, adventure/, dashboard/).  
* lib/: Shared utilities (Cloudinary, Gemini, Stripe, Supabase).  
* hooks/: Custom React hooks (e.g., useWatchTime, useAdventurePath).  
* types/: Centralized TypeScript interfaces.

## **3\. Naming Conventions**

* **Components:** PascalCase (VideoPlayer.tsx).  
* **Functions/Variables:** camelCase (getSignedUrl).  
* **Files:** kebab-case (check-access.ts).  
* **SQL:** snake\_case (watch\_history).

## **4\. Logging & Telemetry (Mandatory)**

Every user-facing action must use the activity\_logs table.

// Example Pattern  
await logActivity({  
  event\_type: 'CHOOSE\_PATH',  
  context: 'crossroads',  
  metadata: {   
    choice: 'random',   
    from\_video: videoId,   
    similarity\_score: score   
  }  
});

## **5\. Security Standards**

* **RLS:** All tables must have Row Level Security enabled.  
* **Secrets:** API Keys (Stripe, Cloudinary, Gemini) must stay in .env.local and never be exposed to the client.  
* **Validation:** Use zod for all form submissions and API request bodies.