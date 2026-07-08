-- Fix missing Foreign Key for account_id in vgvina_financial_transactions
ALTER TABLE vgvina_financial_transactions
ADD CONSTRAINT fk_financial_transactions_accounts
FOREIGN KEY (account_id) REFERENCES vgvina_accounts(id);
