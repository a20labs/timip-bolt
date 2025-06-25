-- Create lexicon schema
CREATE SCHEMA IF NOT EXISTS lexicon;

-- Categories table for vocabulary types
CREATE TABLE lexicon.categories (
  id serial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 999,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Terms table for individual vocabulary items
CREATE TABLE lexicon.terms (
  id serial PRIMARY KEY,
  category_id integer REFERENCES lexicon.categories(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  default_label text NOT NULL,
  description text,
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEPRECATED', 'PENDING')),
  sort_order integer DEFAULT 999,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Translations for multi-language support
CREATE TABLE lexicon.translations (
  term_id integer REFERENCES lexicon.terms(id) ON DELETE CASCADE,
  locale text NOT NULL,
  label text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (term_id, locale)
);

-- Aliases for alternative names and synonyms
CREATE TABLE lexicon.aliases (
  term_id integer REFERENCES lexicon.terms(id) ON DELETE CASCADE,
  alias text NOT NULL,
  locale text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (term_id, alias)
);

-- Changelog for audit trail
CREATE TABLE lexicon.changelog (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all lexicon tables
ALTER TABLE lexicon.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon.aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon.changelog ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories
CREATE POLICY "Everyone can read active categories"
  ON lexicon.categories FOR SELECT
  USING (active = true);

CREATE POLICY "Superadmin can manage categories"
  ON lexicon.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'platform_admin', 'ops_support')
    )
  );

-- RLS Policies for terms
CREATE POLICY "Everyone can read active terms"
  ON lexicon.terms FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "Admins can read all terms"
  ON lexicon.terms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'platform_admin', 'ops_support')
    )
  );

CREATE POLICY "Superadmin can manage terms"
  ON lexicon.terms FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'platform_admin', 'ops_support')
    )
  );

-- RLS Policies for translations
CREATE POLICY "Everyone can read translations"
  ON lexicon.translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lexicon.terms 
      WHERE id = term_id AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Superadmin can manage translations"
  ON lexicon.translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'platform_admin', 'ops_support')
    )
  );

-- RLS Policies for aliases
CREATE POLICY "Everyone can read aliases"
  ON lexicon.aliases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lexicon.terms 
      WHERE id = term_id AND status = 'ACTIVE'
    )
  );

CREATE POLICY "Superadmin can manage aliases"
  ON lexicon.aliases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'platform_admin', 'ops_support')
    )
  );

-- RLS Policies for changelog
CREATE POLICY "Admins can read changelog"
  ON lexicon.changelog FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('superadmin', 'platform_admin', 'ops_support')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_lexicon_categories_key ON lexicon.categories(key);
CREATE INDEX idx_lexicon_categories_active ON lexicon.categories(active);
CREATE INDEX idx_lexicon_terms_category_id ON lexicon.terms(category_id);
CREATE INDEX idx_lexicon_terms_slug ON lexicon.terms(slug);
CREATE INDEX idx_lexicon_terms_status ON lexicon.terms(status);
CREATE INDEX idx_lexicon_translations_term_id ON lexicon.translations(term_id);
CREATE INDEX idx_lexicon_translations_locale ON lexicon.translations(locale);
CREATE INDEX idx_lexicon_aliases_term_id ON lexicon.aliases(term_id);
CREATE INDEX idx_lexicon_aliases_alias ON lexicon.aliases(alias);
CREATE INDEX idx_lexicon_changelog_created_at ON lexicon.changelog(created_at DESC);

-- Function to get term label with fallback
CREATE OR REPLACE FUNCTION lexicon.get_term_label(
  term_id_param integer,
  locale_param text DEFAULT 'en'
)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  label_result text;
BEGIN
  -- Try to get translation for requested locale
  SELECT label INTO label_result
  FROM lexicon.translations
  WHERE term_id = term_id_param AND locale = locale_param;
  
  -- If not found, try English fallback
  IF label_result IS NULL THEN
    SELECT label INTO label_result
    FROM lexicon.translations
    WHERE term_id = term_id_param AND locale = 'en';
  END IF;
  
  -- If still not found, use default label
  IF label_result IS NULL THEN
    SELECT default_label INTO label_result
    FROM lexicon.terms
    WHERE id = term_id_param;
  END IF;
  
  RETURN COALESCE(label_result, 'Unknown');
END;
$$;

-- Function to search terms by alias
CREATE OR REPLACE FUNCTION lexicon.search_by_alias(
  alias_param text,
  category_key_param text DEFAULT NULL
)
RETURNS TABLE(
  term_id integer,
  slug text,
  label text,
  category_key text
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.slug,
    t.default_label,
    c.key
  FROM lexicon.terms t
  JOIN lexicon.categories c ON t.category_id = c.id
  JOIN lexicon.aliases a ON t.id = a.term_id
  WHERE 
    LOWER(a.alias) = LOWER(alias_param)
    AND t.status = 'ACTIVE'
    AND c.active = true
    AND (category_key_param IS NULL OR c.key = category_key_param);
END;
$$;

-- Function to get vocabulary for a category
CREATE OR REPLACE FUNCTION lexicon.get_vocabulary(
  category_key_param text,
  locale_param text DEFAULT 'en'
)
RETURNS TABLE(
  id integer,
  slug text,
  label text,
  description text,
  sort_order integer,
  aliases text[]
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.slug,
    COALESCE(tr.label, t.default_label) as label,
    COALESCE(tr.description, t.description) as description,
    t.sort_order,
    ARRAY(
      SELECT a.alias 
      FROM lexicon.aliases a 
      WHERE a.term_id = t.id 
      ORDER BY a.alias
    ) as aliases
  FROM lexicon.terms t
  JOIN lexicon.categories c ON t.category_id = c.id
  LEFT JOIN lexicon.translations tr ON t.id = tr.term_id AND tr.locale = locale_param
  WHERE 
    c.key = category_key_param
    AND t.status = 'ACTIVE'
    AND c.active = true
  ORDER BY t.sort_order, t.default_label;
END;
$$;

-- Trigger function for changelog - FIXED to handle tables without id column
CREATE OR REPLACE FUNCTION lexicon.log_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  resource_id_value text;
  record_to_jsonb jsonb;
BEGIN
  -- Handle tables with different primary key structures
  IF TG_TABLE_NAME = 'translations' THEN
    -- For translations table which has composite PK (term_id, locale)
    resource_id_value := CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.term_id::text || ':' || OLD.locale
      ELSE NEW.term_id::text || ':' || NEW.locale
    END;
  ELSIF TG_TABLE_NAME = 'aliases' THEN
    -- For aliases table which has composite PK (term_id, alias)
    resource_id_value := CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.term_id::text || ':' || OLD.alias
      ELSE NEW.term_id::text || ':' || NEW.alias
    END;
  ELSE
    -- For tables with id column
    resource_id_value := CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::text
      ELSE NEW.id::text
    END;
  END IF;

  -- Convert record to jsonb based on operation
  IF TG_OP = 'DELETE' THEN
    record_to_jsonb := to_jsonb(OLD);
  ELSE
    record_to_jsonb := to_jsonb(NEW);
  END IF;

  -- Insert into changelog
  INSERT INTO lexicon.changelog (
    actor_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    resource_id_value,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add changelog triggers
CREATE TRIGGER lexicon_categories_changelog
  AFTER INSERT OR UPDATE OR DELETE ON lexicon.categories
  FOR EACH ROW EXECUTE FUNCTION lexicon.log_changes();

CREATE TRIGGER lexicon_terms_changelog
  AFTER INSERT OR UPDATE OR DELETE ON lexicon.terms
  FOR EACH ROW EXECUTE FUNCTION lexicon.log_changes();

CREATE TRIGGER lexicon_translations_changelog
  AFTER INSERT OR UPDATE OR DELETE ON lexicon.translations
  FOR EACH ROW EXECUTE FUNCTION lexicon.log_changes();

CREATE TRIGGER lexicon_aliases_changelog
  AFTER INSERT OR UPDATE OR DELETE ON lexicon.aliases
  FOR EACH ROW EXECUTE FUNCTION lexicon.log_changes();

-- Insert default categories
INSERT INTO lexicon.categories (key, label, description, icon, sort_order) VALUES
  ('GENRE', 'Genres', 'Musical genres and styles', 'Music', 1),
  ('MOOD', 'Moods', 'Emotional characteristics of music', 'Heart', 2),
  ('INSTRUMENT', 'Instruments', 'Musical instruments', 'Guitar', 3),
  ('LANGUAGE', 'Languages', 'Vocal languages', 'Globe', 4),
  ('TEMPO', 'Tempo', 'Speed and rhythm characteristics', 'Clock', 5),
  ('KEY', 'Musical Keys', 'Musical keys and scales', 'Music', 6),
  ('RIGHTS', 'Rights Tags', 'Usage rights and licensing', 'Shield', 7),
  ('ENERGY', 'Energy Level', 'Energy and intensity levels', 'Zap', 8),
  ('VOCAL_STYLE', 'Vocal Styles', 'Vocal performance styles', 'Mic', 9),
  ('PRODUCTION_STYLE', 'Production Styles', 'Production and mixing styles', 'Settings', 10)
ON CONFLICT (key) DO NOTHING;

-- Insert sample terms for genres
WITH category_id AS (
  SELECT id FROM lexicon.categories WHERE key = 'GENRE'
)
INSERT INTO lexicon.terms (category_id, slug, default_label, sort_order) 
SELECT 
  (SELECT id FROM category_id),
  terms.slug,
  terms.default_label,
  terms.sort_order
FROM (VALUES 
  ('electronic', 'Electronic', 1),
  ('hip-hop', 'Hip-Hop', 2),
  ('pop', 'Pop', 3),
  ('rock', 'Rock', 4),
  ('jazz', 'Jazz', 5),
  ('classical', 'Classical', 6),
  ('country', 'Country', 7),
  ('r-b', 'R&B', 8),
  ('folk', 'Folk', 9),
  ('reggae', 'Reggae', 10),
  ('blues', 'Blues', 11),
  ('funk', 'Funk', 12),
  ('house', 'House', 13),
  ('techno', 'Techno', 14),
  ('ambient', 'Ambient', 15),
  ('dubstep', 'Dubstep', 16),
  ('trap', 'Trap', 17),
  ('indie', 'Indie', 18),
  ('alternative', 'Alternative', 19),
  ('metal', 'Metal', 20)
) AS terms(slug, default_label, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample terms for moods
WITH category_id AS (
  SELECT id FROM lexicon.categories WHERE key = 'MOOD'
)
INSERT INTO lexicon.terms (category_id, slug, default_label, sort_order)
SELECT 
  (SELECT id FROM category_id),
  terms.slug,
  terms.default_label,
  terms.sort_order
FROM (VALUES 
  ('happy', 'Happy', 1),
  ('sad', 'Sad', 2),
  ('energetic', 'Energetic', 3),
  ('calm', 'Calm', 4),
  ('aggressive', 'Aggressive', 5),
  ('romantic', 'Romantic', 6),
  ('mysterious', 'Mysterious', 7),
  ('uplifting', 'Uplifting', 8),
  ('melancholic', 'Melancholic', 9),
  ('dreamy', 'Dreamy', 10),
  ('dark', 'Dark', 11),
  ('bright', 'Bright', 12),
  ('nostalgic', 'Nostalgic', 13),
  ('powerful', 'Powerful', 14),
  ('peaceful', 'Peaceful', 15)
) AS terms(slug, default_label, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample aliases
WITH term_aliases AS (
  SELECT t.id AS term_id, a.alias
  FROM lexicon.terms t
  JOIN lexicon.categories c ON t.category_id = c.id
  CROSS JOIN (VALUES 
    ('hip-hop', 'rap'),
    ('hip-hop', 'hiphop'),
    ('electronic', 'edm'),
    ('electronic', 'electronica'),
    ('r-b', 'rnb'),
    ('r-b', 'rhythm and blues'),
    ('pop', 'popular'),
    ('alternative', 'alt'),
    ('dubstep', 'dub'),
    ('energetic', 'high-energy'),
    ('calm', 'chill'),
    ('calm', 'relaxed'),
    ('aggressive', 'intense'),
    ('romantic', 'love'),
    ('uplifting', 'positive')
  ) AS a(term_slug, alias)
  WHERE t.slug = a.term_slug
)
INSERT INTO lexicon.aliases (term_id, alias)
SELECT term_id, alias FROM term_aliases
ON CONFLICT (term_id, alias) DO NOTHING;

-- Insert sample translations (Spanish)
WITH term_translations AS (
  SELECT t.id AS term_id, tr.translation
  FROM lexicon.terms t
  JOIN lexicon.categories c ON t.category_id = c.id
  CROSS JOIN (VALUES 
    ('electronic', 'Electrónica'),
    ('hip-hop', 'Hip-Hop'),
    ('pop', 'Pop'),
    ('rock', 'Rock'),
    ('jazz', 'Jazz'),
    ('classical', 'Clásica'),
    ('country', 'Country'),
    ('happy', 'Feliz'),
    ('sad', 'Triste'),
    ('energetic', 'Energético'),
    ('calm', 'Tranquilo'),
    ('romantic', 'Romántico')
  ) AS tr(term_slug, translation)
  WHERE t.slug = tr.term_slug
)
INSERT INTO lexicon.translations (term_id, locale, label)
SELECT term_id, 'es', translation FROM term_translations
ON CONFLICT (term_id, locale) DO NOTHING;