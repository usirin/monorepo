import {SqlClient, SqlSchema} from "@effect/sql";
import {Effect, Schema, Struct} from "effect";
import {PgLive} from "./Database";

export class AccountSchema extends Schema.TaggedClass<AccountSchema>("AccountSchema")(
	"AccountSchema",
	{
		id: Schema.UUID,
		externalId: Schema.String,
		name: Schema.Trim.pipe(
			Schema.nonEmptyString({
				message: () => "Account name is required",
			}),
		),
		currency: Schema.String,
		balance: Schema.Number,
		availableBalance: Schema.Number,
		balanceDate: Schema.DateTimeUtc,
		source: Schema.Literal("simplefin", "plaid"),
		createdAt: Schema.DateTimeUtc,
		updatedAt: Schema.DateTimeUtc,
	},
) {}

const InsertAccountSchema = Schema.Struct(
	Struct.omit(AccountSchema.fields, "id", "createdAt", "updatedAt"),
);

const UpsertAccountSchema = Schema.Struct(
	Struct.omit(AccountSchema.fields, "id", "createdAt", "updatedAt"),
);

export class Account extends Effect.Service<Account>()("Account", {
	dependencies: [PgLive],
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient;

		const byId = SqlSchema.findOne({
			Request: Schema.UUID,
			Result: AccountSchema,
			execute: (id) => sql`SELECT * FROM accounts WHERE id = ${id}`,
		});

		const all = SqlSchema.findAll({
			Request: Schema.Void,
			Result: AccountSchema,
			execute: () => sql`SELECT * FROM accounts ORDER BY created_at DESC`,
		});

		const byExternalId = SqlSchema.findOne({
			Request: Schema.Struct({
				externalId: Schema.String,
				source: Schema.String,
			}),
			Result: AccountSchema,
			execute: ({externalId, source}) =>
				sql`SELECT * FROM accounts WHERE external_id = ${externalId} AND source = ${source}`,
		});

		const create = SqlSchema.single({
			Request: InsertAccountSchema,
			Result: AccountSchema,
			execute: (account) =>
				sql`INSERT INTO accounts (
					external_id, name, currency, balance, 
					available_balance, balance_date, source
				) VALUES (
					${account.externalId}, ${account.name}, 
					${account.currency}, ${account.balance}, ${account.availableBalance}, 
					${account.balanceDate}, ${account.source}
				) RETURNING *`,
		});

		const upsert = SqlSchema.single({
			Request: UpsertAccountSchema,
			Result: AccountSchema,
			execute: (account) =>
				sql`INSERT INTO accounts (
					external_id, name, currency, balance, 
					available_balance, balance_date, source
				) VALUES (
					${account.externalId}, ${account.name}, 
					${account.currency}, ${account.balance}, ${account.availableBalance}, 
					${account.balanceDate}, ${account.source}
				) 
				ON CONFLICT (external_id, source) DO UPDATE SET
					name = EXCLUDED.name,
					currency = EXCLUDED.currency,
					balance = EXCLUDED.balance,
					available_balance = EXCLUDED.available_balance,
					balance_date = EXCLUDED.balance_date,
					updated_at = now()
				RETURNING *`,
		});

		const updateBalance = SqlSchema.single({
			Request: Schema.Struct({
				id: Schema.UUID,
				balance: Schema.Number,
				availableBalance: Schema.Number,
				balanceDate: Schema.DateTimeUtc,
			}),
			Result: AccountSchema,
			execute: ({id, balance, availableBalance, balanceDate}) =>
				sql`UPDATE accounts SET 
					balance = ${balance}, 
					available_balance = ${availableBalance}, 
					balance_date = ${balanceDate},
					updated_at = now()
				WHERE id = ${id} 
				RETURNING *`,
		});

		return {
			byId,
			all,
			byExternalId,
			create,
			upsert,
			updateBalance,
		};
	}),
}) {}
