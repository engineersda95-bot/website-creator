-- Add custom_domain column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS domain_status text DEFAULT 'pending'; -- 'pending', 'verified', 'failed'
ALTER TABLE projects ADD COLUMN IF NOT EXISTS last_domain_check timestamp with time zone;
