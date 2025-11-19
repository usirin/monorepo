import {BunRuntime} from "@effect/platform-bun";
import {Effect, Layer} from "effect";
import {Gemini} from "./dalaran/Gemini";
import * as SimpleFin from "./SimpleFin";
import {TransactionIngestor} from "./TransactionIngestor";

const program = Effect.gen(function* () {
	yield* Effect.log("Starting SimpleFin sync application");
	const ingestor = yield* TransactionIngestor;

	const oneWeekAgo = Math.floor((Date.now() - 40 * 24 * 60 * 60 * 1000) / 1000);
	console.log(oneWeekAgo);

	yield* ingestor.ingestTransactions({
		startDate: oneWeekAgo,
	});

	yield* Effect.log("SimpleFin sync completed");
});

// Layer composition
const MainLive = Layer.mergeAll(
	// FetchHttpClient.layer,
	// BunContext.layer,
	SimpleFin.SimpleFin.Default,
	TransactionIngestor.Default,
	Gemini.Default,
	// Environment.Default,
	// Account.Default,
	// Transaction.Default,
);

const runnable = program.pipe(Effect.provide(MainLive));

BunRuntime.runMain(runnable);
