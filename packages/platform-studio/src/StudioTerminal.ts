import * as Terminal from "@effect/platform/Terminal";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";

import {StudioTerminalInput} from "./StudioTerminalInput";
import {StudioTerminalOutput} from "./StudioTerminalOutput";
import {StudioTerminalReadline} from "./StudioTerminalReadline";

export const make = Effect.gen(function* () {
	yield* Effect.log(`making a studio terminal`);
	const input = yield* StudioTerminalInput;
	const output = yield* StudioTerminalOutput;
	const line = yield* StudioTerminalReadline;

	const readInput = Effect.async<Terminal.UserInput, Terminal.QuitException, never>((resume) => {
		const program = Effect.gen(function* () {
			yield* Effect.log('"readInput" started');
			const event = yield* input.changes.pipe(
				Stream.filter((event) => Option.isSome(event.input)),
				Stream.take(1),
				Stream.runCollect,
			);

			const i = Chunk.head(event);

			Option.match(i, {
				onSome: (i) => {
					return resume(Effect.succeed(i));
				},
				onNone: () => resume(Effect.never),
			});

			yield* SubscriptionRef.set(input, {
				input: Option.none(),
				key: {name: "", ctrl: false, meta: false, shift: false},
			});
		});

		const fiber = Effect.runFork(program);

		return Effect.sync(() => {
			Effect.runFork(Fiber.interrupt(fiber));
		});
	});

	const readLine = Effect.async<string, Terminal.QuitException, never>((resume) => {
		const program = Effect.gen(function* () {
			const event = yield* line.changes.pipe(
				Stream.filter((event) => event !== ""),
				Stream.take(1),
				Stream.runCollect,
			);

			const i = Chunk.head(event);

			Option.match(i, {
				onSome: (i) => resume(Effect.succeed(i)),
				onNone: () => resume(Effect.never),
			});

			yield* SubscriptionRef.set(line, "");
		});

		const fiber = Effect.runFork(program);

		return Effect.sync(() => {
			Effect.runFork(Fiber.interrupt(fiber));
		});
	});

	const display = (prompt: string) => {
		const stripped = prompt.replace(
			// biome-ignore lint/suspicious/noControlCharactersInRegex: that's ok
			/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
			"",
		);

		return SubscriptionRef.update(output, (acc) => [...acc, stripped]);
	};

	console.log(`Studio terminal created with input: ${input}, output: ${output}, readline: ${line}`);

	return Terminal.Terminal.of({
		columns: Effect.succeed(800),
		readInput,
		readLine,
		display,
	});
});

export const layer = Layer.effect(Terminal.Terminal, make).pipe(
	Layer.provideMerge(
		Layer.mergeAll(
			StudioTerminalInput.Default,
			StudioTerminalReadline.Default,
			StudioTerminalOutput.Default,
		),
	),
);
