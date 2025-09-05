import {SqlClient} from "@effect/sql";
import {Effect} from "effect";

export default Effect.gen(function* () {
	const sql = yield* SqlClient.SqlClient;

	return sql`
    CREATE TABLE IF NOT EXISTS organization (
      id SERIAL PRIMARY KEY,
      sfin_id VARCHAR(255) DEFAULT NULL,
      domain VARCHAR(255) PRIMARY KEY,
      sfin_url VARCHAR(255) NOT NULL,
      name VARCHAR(255) DEFAULT NULL,
      url VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    );

    CREATE TABLE IF NOT EXISTS account (
      id SERIAL PRIMARY KEY,
      sfin_id VARCHAR(255) NOT NULL,

      organization_id INTEGER NOT NULL REFERENCES organization(id),
      name VARCHAR(255) NOT NULL,
      currency VARCHAR(3) NOT NULL,
      balance NUMERIC(18, 2) NOT NULL,
      available_balance NUMERIC(18, 2) NOT NULL,
      balance_date TIMESTAMP WITH TIME ZONE NOT NULL,
      extra JSONB DEFAULT NULL,

      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

      UNIQUE(organization_id, sfin_id)
    );

    CREATE TABLE IF NOT EXISTS transaction (
      id SERIAL PRIMARY KEY,
      sfin_id VARCHAR(255) NOT NULL,

      account_id INTEGER NOT NULL REFERENCES accounts(id),
      posted TIMESTAMP WITH TIME ZONE NOT NULL,
      amount NUMERIC(18, 2) NOT NULL,
      description VARCHAR(255) NOT NULL,
      transacted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
      pending BOOLEAN DEFAULT FALSE,
      extra JSONB DEFAULT NULL,

      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(sfin_id, account_id)
    );
  `;
});
