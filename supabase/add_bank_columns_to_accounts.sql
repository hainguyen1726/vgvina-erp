-- Add bank information columns to vgvina_accounts table
ALTER TABLE vgvina_accounts ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE vgvina_accounts ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE vgvina_accounts ADD COLUMN IF NOT EXISTS account_holder TEXT;
