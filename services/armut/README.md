# SimpleFin Sync

A simple personal finance data sync tool that fetches accounts and transactions from SimpleFin and stores them in a PostgreSQL database.

## Setup

1. **Environment Variables**: Set the following environment variables:
   ```bash
   SIMPLEFIN_TOKEN="your_access_url_here"
   DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
   ```

2. **SimpleFin Token**: The `SIMPLEFIN_TOKEN` should be an Access URL (the result of claiming a SimpleFin token), not a raw claim token. It looks like:
   ```
   https://username:password@server.com/simplefin
   ```

3. **Database Setup**: Run the migration to create tables:
   ```bash
   bun run database/run-migrations.ts
   ```

4. **Run Sync**: Execute the sync process:
   ```bash
   bun run index.ts
   ```

## What it does

- Fetches all accounts from your SimpleFin provider
- Upserts accounts to the database (creates new or updates existing)
- Batch inserts all transactions for each account
- Handles duplicate transactions gracefully (ignores duplicates)
- Provides detailed logging of the sync process

## Database Schema

### Accounts Table
- `id`: UUID primary key
- `external_id`: SimpleFin account ID
- `name`: Account name
- `currency`: Currency code (USD, EUR, etc.)
- `balance`: Current balance
- `available_balance`: Available balance
- `balance_date`: Date of balance snapshot
- `source`: Always "simplefin"
- `created_at`/`updated_at`: Timestamps

### Transactions Table
- `id`: UUID primary key
- `account_id`: References accounts table
- `external_id`: SimpleFin transaction ID
- `posted`: Transaction post date
- `amount`: Transaction amount (positive = credit, negative = debit)
- `description`: Transaction description
- `memo`: Optional memo field
- `source`: Always "simplefin"
- `created_at`/`updated_at`: Timestamps

## Notes

- This is designed for personal use with a single SimpleFin provider
- The application is idempotent - you can run it multiple times safely
- Transactions are deduplicated by `external_id` and `account_id`
- Accounts are deduplicated by `external_id` and `source`