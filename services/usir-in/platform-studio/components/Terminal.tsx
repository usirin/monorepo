"use client";

import * as FileSystem from "@effect/platform/FileSystem";
import * as EffectTerminal from "@effect/platform/Terminal";
import {StudioConsole, StudioTerminalInput, StudioTerminalOutput} from "@usirin/platform-studio";
import {pipe} from "effect";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import * as SubscriptionRef from "effect/SubscriptionRef";
import React from "react";
import {parse} from "shell-quote";
import {getCommand} from "../commands";
import {StudioRuntime} from "../StudioRuntime";

const parseCmd = (input: string) => parse(input).filter((arg) => typeof arg === "string");

// const watcher = pipe(
// 	FileSystem.FileSystem,
// 	Effect.map((fs) => fs.watch("/")),
// 	Stream.unwrap,
// 	Stream.runForEach((event) => Effect.log(`event happened: ${JSON.stringify(event)}`)), // TODO: remove this
// );
//
// watcher.pipe(Effect.provide(Logger.pretty), runtime.runFork);

const updateTestFile = Effect.fn(function* (content: string, filename: string = "/test.txt") {
	yield* Effect.log(`updateTestFile: ${filename}`);
	const fs = yield* FileSystem.FileSystem;

	const before = yield* fs
		.readFileString(filename, "utf-8")
		.pipe(Effect.catchAll(() => Effect.succeed("")));

	yield* fs.writeFileString(filename, content);
	const after = yield* fs.readFileString(filename, "utf-8");

	return {before, after};
});

export function Terminal() {
	const [stdout, setStdout] = React.useState<string[]>([]);
	const [inputValue, setInputValue] = React.useState<string>("");
	const inputRef = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		const program = Effect.gen(function* () {
			const output = yield* StudioTerminalOutput.StudioTerminalOutput;

			yield* output.changes.pipe(
				Stream.tap((event) => Effect.sync(() => setStdout(event))),
				Stream.runDrain,
			);
		});

		StudioRuntime.runFork(program);
	}, []);

	React.useEffect(() => {
		const program = Effect.gen(function* () {
			const terminal = yield* EffectTerminal.Terminal;
			yield* Effect.log("start");

			yield* updateTestFile("hello...").pipe(Effect.tap(({after}) => terminal.display(after)));
			yield* Effect.sleep("1 seconds");
			yield* updateTestFile("hello...2").pipe(Effect.tap(({after}) => terminal.display(after)));
		});

		StudioRuntime.runFork(program);
	}, []);

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		const input = Effect.gen(function* () {
			const input = yield* StudioTerminalInput.StudioTerminalInput;

			yield* SubscriptionRef.set(input, {
				input: Option.some(event.key),
				key: {
					name: event.key,
					ctrl: event.ctrlKey,
					meta: event.metaKey,
					shift: event.shiftKey,
				},
			});
		});

		StudioRuntime.runFork(input);
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	const onRunCommand = (e: any) => {
		e.preventDefault();
		const program = Effect.gen(function* () {
			const console = yield* StudioConsole.make;

			const argv = parseCmd(inputValue);
			const cmd = getCommand(argv[0]);
			yield* Console.log({cmd, argv});

			const cli = Option.getOrThrow(cmd);

			return yield* pipe(
				cli([":", ...argv]),
				Effect.withConsole(console),
				Effect.andThen(() => setInputValue("")),
			);
		});

		StudioRuntime.runFork(program);
	};

	return (
		<form onSubmit={onRunCommand}>
			{stdout.map((line, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: this is command line
				<pre key={index}>{line}</pre>
			))}
			<input value={inputValue} ref={inputRef} onKeyDown={onKeyDown} onChange={onChange} />
			<button type="submit">Run</button>
		</form>
	);
}

console.log(process.argv);
