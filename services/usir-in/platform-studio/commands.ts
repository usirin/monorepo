import {Command, Options} from "@effect/cli";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";

const studio = Command.make("studio", {}, () =>
	Effect.gen(function* () {
		yield* Effect.log("Studio command executed");
		return "Studio command executed successfully";
	}),
).pipe(
	Command.withDescription("Manage the studio commands"),
	Command.withSubcommands([
		Command.make("messages", {}, () =>
			Effect.gen(function* () {
				//
			}),
		).pipe(
			Command.withDescription("Show command logs"),
			Command.withSubcommands([
				Command.make("clear", {}, () =>
					Effect.gen(function* () {
						yield* Effect.log("Clear command logs executed");
						return "Command logs cleared successfully";
					}),
				).pipe(Command.withDescription("Clear command logs")),
			]),
		),
		Command.make("workspace", {}, () =>
			Effect.gen(function* () {
				yield* Effect.log("Workspace command executed");
				return "Workspace command executed successfully";
			}),
		).pipe(
			Command.withDescription("Manage the workspace"),
			Command.withSubcommands([
				Command.make("create", {}, () =>
					Effect.gen(function* () {
						yield* Effect.log("Create workspace command executed");
						return "Workspace created successfully";
					}),
				).pipe(Command.withDescription("Create a new workspace")),
			]),
		),
	]),
);

const eval$ = (code: string) =>
	Effect.try({
		// biome-ignore lint/security/noGlobalEval: this is a controlled environment
		try: () => eval(code),
		catch: (error) => {
			throw new Error(`Error evaluating code: ${error}`);
		},
	});

const js = Command.make("js", {code: Options.text("code")}, ({code}) =>
	Effect.gen(function* () {
		console.log(`Executing JavaScript code: ${code}`);
		const result = yield* eval$(code);
		yield* Effect.log(`JavaScript code executed: ${result}`);
		return result;
	}),
).pipe(Command.withDescription("Manage JavaScript commands"));

export const commands = {
	studio: Command.run(studio, {
		name: "Studio commands",
		version: "v1.0.0",
	}),
	js: Command.run(js, {
		name: "JavaScript commands",
		version: "v1.0.0",
	}),
};

export const getCommand = (name: string) =>
	Option.fromNullable(commands[name as keyof typeof commands]);
