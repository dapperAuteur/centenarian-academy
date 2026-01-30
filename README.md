# **Centenarian Athlete Academy**

The Centenarian Athlete Academy (CAA) is a high-performance Learning Management System designed for fitness professionals pursuing the NASM CPT, CES, and CNC certifications.

## **🌟 The Vision**

Built on the "Story-Led Flywheel" strategy, this app transforms a standard curriculum into a **Choose Your Own Adventure** journey. It mirrors the long, non-linear path to becoming a centenarian athlete.

## **🚀 Key Features**

* **Adventure Engine:** Non-linear video navigation with AI-suggested related paths.  
* **AI Recommendation:** Powered by **Gemini API** and **Supabase pgvector**, calculating semantic similarity between video transcripts.  
* **Secure Gating:** Hierarchical permissions (Global, Section, Chapter, Video) with Cloudinary Signed URLs.  
* **Integrated Payments:** $100 one-time purchase via Stripe.  
* **Study Locker:** Gated downloads for transcripts, flashcards, and study guides.  
* **The Logbook:** Visual trail mapping of a student's personal journey.

## **🛠 Tech Stack**

* **Next.js 14** (App Router)  
* **Supabase** (Auth, Database, pgvector, Edge Functions)  
* **Cloudinary** (Video CDN & AI Clipping)  
* **Gemini API** (Transcript Embeddings)  
* **Stripe** (Payments)  
* **Tailwind CSS & Framer Motion** (UI/UX)

## **📦 Setup Instructions**

1. **Clone & Install:**  
   npm install

2. **Environment Variables:**  
   Copy .env.example to .env.local and fill in your Supabase, Cloudinary, Stripe, and Gemini credentials.  
3. **Database Setup:**  
   Run the setup\_schema.sql in your Supabase SQL Editor.  
4. **Run Development:**  
   npm run dev

## **📊 Telemetry & Insights**

This app implements **Intent-Aware Logging**. We don't just track *what* students do, but *why* they do it—helping us refine the curriculum and the adventure paths over time.

*Built for the Long Run.*# centenarian-academy
