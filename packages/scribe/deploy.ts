import {Effect, Layer} from "effect";
import {BunContext, BunRuntime} from "@effect/platform-bun";
import {Commands} from "./Commands";

const program = Effect.gen(function* () {
	const commands = yield* Commands;

	yield* Effect.log("Starting command installation...");

	yield* commands.install();

	yield* Effect.log("Command installation finished.");
});

BunRuntime.runMain(
	program.pipe(Effect.provide(Layer.mergeAll(BunContext.layer, Commands.Default))),
);
