-- Migration: Add initial_balance column to vgvina_accounts table
ALTER TABLE vgvina_accounts ADD COLUMN IF NOT EXISTS initial_balance NUMERIC DEFAULT 0;
