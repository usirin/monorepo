import {SqlClient, SqlSchema} from "@effect/sql";
import {Effect, Schema, Struct} from "effect";
import {PgLive} from "./Database";

export class TransactionSchema extends Schema.TaggedClass<TransactionSchema>("TransactionSchema")(
	"TransactionSchema",
	{
		id: Schema.Number,
		sfinId: Schema.String,
		accountId: Schema.Number,
		posted: Schema.DateTimeUtc,
		amount: Schema.Number,
		description: Schema.String,
		transactedAt: Schema.optional(Schema.DateTimeUtc),
		createdAt: Schema.DateTimeUtc,
	},
) {}

const InsertTransactionSchema = Schema.Struct(
	Struct.omit(TransactionSchema.fields, "id", "createdAt"),
);

export class Transaction extends Effect.Service<Transaction>()("Transaction", {
	dependencies: [PgLive],
	effect: Effect.gen(function* () {
		const sql = yield* SqlClient.SqlClient;

		const byId = SqlSchema.findOne({
			Request: Schema.UUID,
			Result: TransactionSchema,
			execute: (id) => sql`SELECT * FROM transaction WHERE id = ${id}`,
		});

		const byAccountId = SqlSchema.findAll({
			Request: Schema.Struct({
				accountId: Schema.UUID,
				limit: Schema.optional(Schema.Number),
			}),
			Result: TransactionSchema,
			execute: ({accountId, limit = 100}) =>
				sql`SELECT * FROM transaction
				WHERE account_id = ${accountId}
				ORDER BY posted DESC
				LIMIT ${limit}`,
		});

		const byExternalId = SqlSchema.findOne({
			Request: Schema.Struct({
				sfinId: Schema.String,
				accountId: Schema.Number,
			}),
			Result: TransactionSchema,
			execute: ({sfinId, accountId}) =>
				sql`SELECT * FROM transaction
				WHERE sfin_id = ${sfinId} AND account_id = ${accountId}`,
		});

		const create = SqlSchema.single({
			Request: InsertTransactionSchema,
			Result: TransactionSchema,
			execute: (transaction) =>
				sql`INSERT INTO transaction (
					account_id, sfin_id, posted, amount,
					description, transacted_at
				) VALUES (
					${transaction.accountId}, ${transaction.sfinId},
					${transaction.posted}, ${transaction.amount},
					${transaction.description},
					${transaction.transactedAt ?? null}
				) RETURNING *`,
		});

		const upsert = SqlSchema.single({
			Request: InsertTransactionSchema,
			Result: TransactionSchema,
			execute: (transaction) =>
				sql`INSERT INTO transaction (
					account_id, sfin_id, posted, amount,
					description, transacted_at
				) VALUES (
					${transaction.accountId}, ${transaction.sfinId},
					${transaction.posted}, ${transaction.amount},
					${transaction.description},
					${transaction.transactedAt ?? null}
				)
				ON CONFLICT (sfin_id, account_id) DO UPDATE SET
					posted = EXCLUDED.posted,
					amount = EXCLUDED.amount,
					description = EXCLUDED.description,
					transacted_at = EXCLUDED.transacted_at
				RETURNING *`,
		});

		const createMany = SqlSchema.findAll({
			Request: Schema.Array(InsertTransactionSchema),
			Result: TransactionSchema,
			execute: (transactions) => {
				if (transactions.length === 0) return sql`SELECT * FROM transaction WHERE 1 = 0`;

				const values = transactions.map(
					(t) =>
						sql`(${t.accountId}, ${t.sfinId}, ${t.posted}, ${t.amount}, ${t.description}, ${t.transactedAt ?? null})`,
				);

				const valuesClause = values.reduce((acc, value, index) => {
					return index === 0 ? value : sql`${acc}, ${value}`;
				});

				return sql`INSERT INTO transaction (
				account_id, sfin_id, posted, amount,
				description, transacted_at
			) VALUES ${valuesClause} RETURNING *
			ON CONFLICT (sfin_id, account_id) DO NOTHING`;
			},
		});

		return {
			byId,
			byAccountId,
			byExternalId,
			create,
			upsert,
			createMany,
		};
	}),
}) {}
