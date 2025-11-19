import {FileSystem} from "@effect/platform";
import {BunFileSystem} from "@effect/platform-bun";
import {Effect, Stream} from "effect";
import {SimpleFin} from "./SimpleFin";

export class TransactionIngestor extends Effect.Service<TransactionIngestor>()(
	"TransactionIngestor",
	{
		dependencies: [SimpleFin.Default, BunFileSystem.layer],
		scoped: Effect.gen(function* () {
			yield* Effect.log("TransactionIngestor service initialized");
			const sf = yield* SimpleFin;
			const fs = yield* FileSystem.FileSystem;

			const ingestTransactions = Effect.fn("TransactionIngestor.ingestTransactions")(function* ({
				startDate,
			}: {
				startDate: number;
			}) {
				yield* Effect.log(`Ingesting transactions from ${new Date(startDate).toISOString()}`);
				const {accounts, errors} = yield* sf.getAccounts({startDate});

				return yield* Stream.fromIterable(accounts).pipe(
					Stream.runForEach(
						Effect.fn(function* (account) {
							yield* fs.writeFileString(
								`${__dirname}/transactions/${account.id}.json`,
								JSON.stringify(account, null, 2),
							);
						}),
					),
				);
			});

			return {ingestTransactions};
		}),
	},
) {}
