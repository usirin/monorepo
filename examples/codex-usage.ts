import {PluginService, definePlugin} from "@usirin/codex";
import {Context, Effect, pipe} from "effect";

// Define service interfaces
class DatabaseService extends Context.Tag("DatabaseService")<
	DatabaseService,
	{
		connect: () => Effect.Effect<void>;
		query: <T>(sql: string) => Effect.Effect<T[]>;
	}
>() {}

class LoggerService extends Context.Tag("LoggerService")<
	LoggerService,
	{
		info: (msg: string) => Effect.Effect<void>;
		error: (err: Error) => Effect.Effect<void>;
	}
>() {}

// Create plugins
const databasePlugin = definePlugin({
	name: "database",
	version: "1.0.0",
	register: Effect.gen(function* (_) {
		const connection = yield* Effect.tryPromise(() => createConnection());

		const service = DatabaseService.of({
			connect: () => Effect.sync(() => connection.connect()),
			query: <T>(sql: string) => Effect.tryPromise(() => connection.query<T>(sql)),
		});

		return service;
	}),
	cleanup: Effect.sync(() => connection.close()),
});

const loggerPlugin = definePlugin({
	name: "logger",
	version: "1.0.0",
	register: Effect.succeed(
		LoggerService.of({
			info: (msg) => Effect.sync(() => console.log(msg)),
			error: (err) => Effect.sync(() => console.error(err)),
		}),
	),
});

// Create a plugin that depends on others
const userServicePlugin = definePlugin({
	name: "userService",
	version: "1.0.0",
	dependencies: new Set(["database", "logger"]),
	register: Effect.gen(function* (_) {
		const db = yield* Effect.serviceSync(DatabaseService);
		const logger = yield* Effect.serviceSync(LoggerService);

		const getUsers = () =>
			pipe(
				db.query<User>("SELECT * FROM users"),
				Effect.tap(() => logger.info("Users fetched")),
			);

		return {getUsers};
	}),
});

// Usage
const program = Effect.gen(function* (_) {
	const codex = yield* Effect.serviceSync(PluginService);

	yield* codex.register(loggerPlugin);
	yield* codex.register(databasePlugin);
	yield* codex.register(userServicePlugin);

	const context = yield* codex.init();

	return context;
});

// Run the program
Effect.runPromise(
	program.pipe(Effect.provideService(PluginService, new PluginServiceLive())),
).catch(console.error);

// Cleanup on shutdown
process.on("SIGINT", () => {
	Effect.runPromise(
		pipe(
			Effect.serviceSync(PluginService),
			Effect.flatMap((codex) => codex.cleanup()),
		),
	);
});
