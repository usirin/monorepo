import {Data, Effect, Schema} from "effect";
import * as Command from "./Command";

export class CommandBookError extends Data.TaggedError("CommandBookError")<{
	method: string;
	cause: unknown;
}> {}

export const make = <CommandList extends Command.AnyCommand[]>(...commands: CommandList) => {
	type CommandMap = Command.CommandsToRecord<CommandList>;
	// Build the runtime map
	const commandMap = {} as CommandMap;
	for (const cmd of commands) {
		(commandMap as any)[cmd.name] = cmd;
	}

	const execute = <Key extends keyof CommandMap>(
		key: Key,
		params: Command.ParamsOf<CommandMap[Key]>,
	) => {
		const cmd = commandMap[key];
		return cmd.execute(params) as ReturnType<typeof cmd.execute>;
	};

	return {execute};
};

const example = Command.make("example", Schema.Struct({text: Schema.String}), ({text}) =>
	Effect.succeed(`Example command executed with text: ${text}`),
);

const sample = Command.make("sample", Schema.Number, (count) => Effect.succeed(count * 2));

const foo = Command.execute(example, {text: "5"});

const cmds = [example, sample] as const;

type ExampleParams = Command.ParamsOf<typeof example>;

const res = book.execute("example", {text: "Hello, World!"});
