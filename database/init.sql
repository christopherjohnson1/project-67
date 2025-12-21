-- Treasure Hunt Application Database Schema
-- PostgreSQL 15+ with UUID support
-- All identifiers use snake_case per database standards

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function for auto-updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE users IS 'Application users - treasure hunt participants';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password (never store plain text)';

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- PUZZLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS puzzles (
  id SERIAL PRIMARY KEY,
  order_number INTEGER UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  puzzle_type VARCHAR(50) NOT NULL,
  puzzle_data JSONB NOT NULL DEFAULT '{}',
  solution_hash VARCHAR(255),
  image_url VARCHAR(500),
  clue_text TEXT,
  console_easter_egg TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT puzzle_type_check CHECK (puzzle_type IN ('riddle', 'cipher', 'image', 'form', 'code', 'location')),
  CONSTRAINT order_number_positive CHECK (order_number > 0)
);

COMMENT ON TABLE puzzles IS 'Puzzle definitions with flexible JSONB data storage';
COMMENT ON COLUMN puzzles.order_number IS 'Linear progression order (1, 2, 3...)';
COMMENT ON COLUMN puzzles.puzzle_type IS 'Type of puzzle: riddle, cipher, image, form, code, location';
COMMENT ON COLUMN puzzles.puzzle_data IS 'Flexible JSONB field for puzzle-specific configuration';
COMMENT ON COLUMN puzzles.solution_hash IS 'Hashed correct answer for validation';
COMMENT ON COLUMN puzzles.console_easter_egg IS 'Hidden message displayed in browser console';

CREATE INDEX IF NOT EXISTS idx_puzzles_order_number ON puzzles(order_number);
CREATE INDEX IF NOT EXISTS idx_puzzles_type ON puzzles(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_puzzles_data ON puzzles USING GIN (puzzle_data);

CREATE TRIGGER trigger_puzzles_updated_at
  BEFORE UPDATE ON puzzles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- USER_PROGRESS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id INTEGER NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0 NOT NULL,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT user_progress_unique UNIQUE(user_id, puzzle_id),
  CONSTRAINT attempts_non_negative CHECK (attempts >= 0),
  CONSTRAINT completed_at_requires_completion CHECK (
    (is_completed = TRUE AND completed_at IS NOT NULL) OR 
    (is_completed = FALSE AND completed_at IS NULL)
  )
);

COMMENT ON TABLE user_progress IS 'Tracks puzzle completion and attempts per user';
COMMENT ON COLUMN user_progress.attempts IS 'Number of times user attempted this puzzle';

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_puzzle_id ON user_progress(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(user_id, is_completed);

-- ============================================================================
-- HINTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hints (
  id SERIAL PRIMARY KEY,
  puzzle_id INTEGER NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  hint_order INTEGER NOT NULL,
  hint_text TEXT NOT NULL,
  cost INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT hint_order_positive CHECK (hint_order > 0),
  CONSTRAINT cost_non_negative CHECK (cost >= 0),
  CONSTRAINT puzzle_hint_order_unique UNIQUE(puzzle_id, hint_order)
);

COMMENT ON TABLE hints IS 'Multiple hints per puzzle, revealed in order';
COMMENT ON COLUMN hints.hint_order IS 'Order in which hints are revealed (1st, 2nd, 3rd...)';
COMMENT ON COLUMN hints.cost IS 'Optional: cost in "hint coins" to unlock';

CREATE INDEX IF NOT EXISTS idx_hints_puzzle_id ON hints(puzzle_id, hint_order);

-- ============================================================================
-- HINT_REQUESTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS hint_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  puzzle_id INTEGER NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  hint_id INTEGER NOT NULL REFERENCES hints(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  was_helpful BOOLEAN,
  
  CONSTRAINT hint_request_unique UNIQUE(user_id, hint_id)
);

COMMENT ON TABLE hint_requests IS 'Tracks when users request hints';
COMMENT ON COLUMN hint_requests.was_helpful IS 'Optional user feedback on hint usefulness';

CREATE INDEX IF NOT EXISTS idx_hint_requests_user_id ON hint_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_hint_requests_puzzle_id ON hint_requests(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_hint_requests_requested_at ON hint_requests(requested_at DESC);

-- ============================================================================
-- REFRESH_TOKENS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT token_not_empty CHECK (char_length(token) > 0),
  CONSTRAINT expires_after_creation CHECK (expires_at > created_at)
);

COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Token expiry timestamp (typically 7 days)';

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ============================================================================
-- ACTIVITY_LOG TABLE (Optional)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT action_type_check CHECK (action_type IN (
    'login', 'logout', 'register', 
    'puzzle_attempt', 'puzzle_completed', 
    'hint_request', 'console_access'
  ))
);

COMMENT ON TABLE activity_log IS 'Audit log of user actions for analytics and debugging';
COMMENT ON COLUMN activity_log.details IS 'Flexible JSONB for action-specific metadata';

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action_type ON activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_details ON activity_log USING GIN (details);

COMMIT;

-- ============================================================================
-- INITIAL SEED DATA (Optional - for development/testing)
-- ============================================================================
-- Uncomment to add sample data during initialization

-- BEGIN;
-- 
-- -- Sample user (password: 'treasure123' - hashed with bcrypt)
-- INSERT INTO users (id, username, email, password_hash) VALUES
--   ('00000000-0000-0000-0000-000000000001'::uuid, 
--    'demo_user', 
--    'demo@example.com',
--    '$2b$10$rKv0vB5YfZfZfZfZfZfZfZfZfZfZfZfZfZfZfZfZfZfZ');
-- 
-- -- Sample puzzle
-- INSERT INTO puzzles (order_number, title, description, puzzle_type, puzzle_data, solution_hash) VALUES
--   (1, 
--    'The First Clue', 
--    'Solve this riddle to begin your journey',
--    'riddle',
--    '{"riddle_text": "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?"}',
--    '$2b$10$hashedanswergoeshere');
-- 
-- COMMIT;

