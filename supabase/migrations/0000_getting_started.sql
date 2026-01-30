-- 1. EXTENSIONS
-- Enable pgvector for the Gemini embedding recommendation engine
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE resource_level AS ENUM ('global', 'section', 'chapter', 'video');
    CREATE TYPE asset_type AS ENUM ('transcript', 'study_guide', 'flashcard');
    CREATE TYPE permission_status AS ENUM ('granted', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- Profiles & Access
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_paid BOOLEAN DEFAULT FALSE,
    total_watch_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curriculum Structure
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    description TEXT
);

-- Videos (The Core Content Nodes)
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cloudinary_public_id TEXT NOT NULL,
    social_clip_id TEXT, -- Cloudinary ID for the short shareable clip
    is_opener BOOLEAN DEFAULT FALSE, -- First video in chapter (Free)
    is_published BOOLEAN DEFAULT FALSE,
    release_date TIMESTAMPTZ,
    order_index INTEGER NOT NULL,
    
    -- Transcript & AI Logic
    transcript_text TEXT,
    embedding VECTOR(1536), -- Dimension for Gemini text-embedding-004
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Assets (Transcripts, Guides, Flashcards)
CREATE TABLE IF NOT EXISTS study_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Storage path
    type asset_type NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hierarchical Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    resource_type resource_level NOT NULL,
    resource_id UUID, -- NULL if resource_type is 'global'
    status permission_status DEFAULT 'granted',
    granted_by UUID REFERENCES auth.users,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    last_position_seconds INTEGER DEFAULT 0,
    percent_complete INTEGER DEFAULT 0,
    watch_count INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    last_watched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Advanced Behavioral Logging
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- e.g., 'CHOOSE_PATH', 'STUDY_ASSET_DOWNLOAD'
    context TEXT, -- e.g., 'adventure_engine', 'on_page_reader'
    metadata JSONB, -- Store source_video, selected_path, similarity_score, etc.
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNCTIONS & LOGIC

-- Semantic Search Function for Recommendations
CREATE OR REPLACE FUNCTION match_videos (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INTEGER,
  exclude_id UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM videos v
  WHERE v.id != exclude_id
    AND v.is_published = true
    AND 1 - (v.embedding <=> query_embedding) > match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Complex Access Check Function
CREATE OR REPLACE FUNCTION check_resource_access(u_id UUID, v_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_rec RECORD;
    has_access BOOLEAN := FALSE;
BEGIN
    -- 1. Fetch video hierarchy
    SELECT v.is_opener, v.chapter_id, c.section_id INTO v_rec
    FROM videos v
    JOIN chapters c ON v.chapter_id = c.id
    WHERE v.id = v_id;

    -- 2. Rule: Chapter Openers are always free
    IF v_rec.is_opener THEN
        RETURN TRUE;
    END IF;

    -- 3. Check for Global Grant
    IF EXISTS (SELECT 1 FROM permissions WHERE user_id = u_id AND resource_type = 'global' AND status = 'granted') THEN
        RETURN TRUE;
    END IF;

    -- 4. Check Section Grant
    IF EXISTS (SELECT 1 FROM permissions WHERE user_id = u_id AND resource_type = 'section' AND resource_id = v_rec.section_id AND status = 'granted') THEN
        RETURN TRUE;
    END IF;

    -- 5. Check Chapter Grant
    IF EXISTS (SELECT 1 FROM permissions WHERE user_id = u_id AND resource_type = 'chapter' AND resource_id = v_rec.chapter_id AND status = 'granted') THEN
        RETURN TRUE;
    END IF;

    -- 6. Check Individual Video Grant
    IF EXISTS (SELECT 1 FROM permissions WHERE user_id = u_id AND resource_type = 'video' AND resource_id = v_id AND status = 'granted') THEN
        RETURN TRUE;
    END IF;

    -- 7. Fallback: Check if user has is_paid = true in profile (Default Global Access)
    SELECT is_paid INTO has_access FROM profiles WHERE id = u_id;
    
    RETURN COALESCE(has_access, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can see published chapter openers
CREATE POLICY "Public can see openers" ON videos
    FOR SELECT USING (is_opener = true AND is_published = true);

-- Policy: Paid users can see everything
CREATE POLICY "Paid users see all" ON videos
    FOR SELECT USING (
        check_resource_access(auth.uid(), id)
    );

-- Asset Access Policy (Assets inherit video access)
CREATE POLICY "Asset access follows video" ON study_assets
    FOR SELECT USING (
        is_public = true OR check_resource_access(auth.uid(), video_id)
    );
-- (All previous tables remain: profiles, sections, chapters, videos, study_assets, permissions, watch_history, activity_logs)

-- 6. PAYMENT TRACKING
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    stripe_session_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT,
    amount_total INTEGER NOT NULL, -- Stored in cents (e.g., 10000 for $100)
    currency TEXT NOT NULL,
    status TEXT NOT NULL, -- e.g., 'complete', 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically update 'is_paid' when a successful payment is logged
CREATE OR REPLACE FUNCTION update_profile_paid_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'complete' THEN
        UPDATE profiles SET is_paid = TRUE WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_complete
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_profile_paid_status();