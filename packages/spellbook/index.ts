import type {z} from "zod";

export type CommandHandler<T extends z.ZodType> = (args: z.infer<T>) => Promise<void> | void;

export type InferCommandInput<T> = T extends Command<infer S> ? z.infer<S> : never;

export interface Command<TSchema extends z.ZodType> {
	description: string;
	input: TSchema;
	execute: (args: z.output<TSchema>) => void;
}

export function defineCommand<TSchema extends z.ZodType>({
	description,
	input,
	execute,
}: Command<TSchema>) {
	return {description, input, execute};
}

export function createSpellbook<TCommands extends Record<string, Command<z.ZodTypeAny>>>(
	commands: TCommands,
) {
	return {
		commands,
		execute: <TKey extends keyof TCommands>(
			key: TKey,
			args?: z.input<TCommands[TKey]["input"]>,
		) => {
			const command = commands[key];
			if (!command) {
				throw new Error(`Command not found: ${key as string}`);
			}
			const parsed = command.input.safeParse(args);
			if (!parsed.success) {
				throw new Error("Invalid arguments");
			}
			command.execute(parsed.data);
		},
	};
}

export class Spellbook<TCommands extends Record<string, Command<z.ZodTypeAny>>> {
	#commands: TCommands;

	static create() {
		return new Spellbook<Record<never, Command<z.ZodTypeAny>>>();
	}

	constructor(commands: TCommands = {} as TCommands) {
		this.#commands = commands;
	}

	command<TKey extends string, TSchema extends z.ZodType>(key: TKey, command: Command<TSchema>) {
		return new Spellbook<TCommands & Record<TKey, Command<TSchema>>>({
			...this.#commands,
			[key]: command,
		});
	}

	build() {
		return createSpellbook(this.#commands);
	}
}
