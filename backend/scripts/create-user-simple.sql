-- Add role column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        -- Create enum type if it doesn't exist
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
                CREATE TYPE user_role_enum AS ENUM('USER', 'ADMIN', 'COMPANY');
            END IF;
        END $$;
        
        -- Add role column
        ALTER TABLE users ADD COLUMN role user_role_enum NOT NULL DEFAULT 'USER';
        
        -- Update existing users
        UPDATE users SET role = 'USER' WHERE role IS NULL;
    END IF;
END $$;

-- Create test user (will fail if user already exists, that's OK)
INSERT INTO users (username, email, password, role, rank, reputation_points)
VALUES (
    'testuser',
    'test@highlit.dev',
    '$2b$10$rK8Q8Q8Q8Q8Q8Q8Q8Q8Qe.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q', -- Test1234!
    'USER',
    'INTERN',
    0
)
ON CONFLICT (email) DO NOTHING;

-- Show created user info
SELECT 
    id,
    username,
    email,
    role,
    rank,
    reputation_points,
    created_at
FROM users 
WHERE email = 'test@highlit.dev';

