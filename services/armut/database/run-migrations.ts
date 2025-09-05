import {Path} from "@effect/platform";
import {BunContext, BunRuntime} from "@effect/platform-bun";
import {PgMigrator} from "@effect/sql-pg";
import {Effect, Layer} from "effect";
import {PgLive} from "./Database";

const program = Effect.gen(function* () {
	const path = yield* Path.Path;

	const migrations = yield* PgMigrator.run({
		loader: PgMigrator.fromFileSystem(path.join(__dirname, "./migrations")),
		schemaDirectory: path.join(__dirname, "./migrations"),
	});

	if (migrations.length > 0) {
		yield* Effect.log("Migrations applied:");
		for (const [id, name] of migrations) {
			yield* Effect.log(`- ${id} - ${name}`);
		}
	} else {
		yield* Effect.log("No migrations applied");
	}
});

const MainLive = Layer.mergeAll(BunContext.layer, PgLive);

BunRuntime.runMain(program.pipe(Effect.provide(MainLive)));
