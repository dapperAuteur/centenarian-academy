# **UI/UX & Component Guide: The Centenarian Aesthetic**

## **1\. Design Tokens**

* **Core Font:** Noto Sans (Clean, highly legible for all ages).  
* **Primary Color:** Slate-900 (The Stability of Longevity).  
* **Secondary Color:** Emerald-500 (Vitality/Success).  
* **Accent Color:** Amber-400 (The "Unknown Path" / Discovery).  
* **Radius:** rounded-2xl (Modern, approachable, premium).

## **2\. Core Components**

### **2.1 The Crossroads (Post-Video Choice)**

* **Visual:** A minimalist overlay that fades in as the video ends.  
* **Layout:** A grid of 5 interactive "Path Cards."  
* **Behavior:** "The Next Step" is highlighted; "The Unknown Path" (Random) has a pulse animation.

### **2.2 The Trail Map (Logbook)**

* **Visual:** A non-linear SVG path representing the curriculum.  
* **Nodes:** Circles that glow when completed, grayscale when locked, and pulsating when "In Progress."  
* **Interaction:** Clicking a node shows a preview of that Chapter's "Opener."

### **2.3 The Transcript Reader**

* **Visual:** Side-car layout next to the video player.  
* **Functionality:** Text highlighting that follows video playback (Synced via currentTime).  
* **Search:** In-transcript search that highlights keywords.

### **2.4 The Admin Permission Grid**

* **Visual:** A matrix of Users vs. Sections/Chapters.  
* **Functionality:** Simple toggle switches to grant/revoke access instantly.

## **3\. UX Principles**

* **No Dead Ends:** Every video must lead to the Crossroads.  
* **Lead Funnels:** Unauthenticated users can play "Openers" but see a "Blur Overlay" and "Unlock for $100" CTA for study assets.  
* **Zero-Alert Policy:** Use a custom Toast or Modal system for notifications.