import type {z} from "zod";

export type CommandHandler<T extends z.ZodType, TReturn = void> = (args: {input: z.output<T>}) =>
	| Promise<TReturn>
	| TReturn;

export type InferCommandInput<T> = T extends Command<infer S, z.ZodType> ? z.infer<S> : never;
export type InferCommandReturn<T> = T extends Command<z.ZodType, infer R> ? R : never;

export interface Command<TSchema extends z.ZodType, TReturn = void> {
	description: string;
	meta?: {
		icon?: string;
		group?: string;
		hidden?: boolean;
	};
	input: () => Promise<TSchema> | TSchema;
	execute: CommandHandler<TSchema, TReturn>;
}

function createSpellbook<TCommands extends Record<string, Command<z.ZodType, any>>>(
	commands: TCommands,
) {
	return {
		commands,
		execute: async <TKey extends keyof TCommands>(
			key: TKey,
			args?: z.input<Awaited<ReturnType<TCommands[TKey]["input"]>>>,
		): Promise<ReturnType<TCommands[TKey]["execute"]>> => {
			const command = commands[key];
			if (!command) {
				throw new Error(`Command not found: ${key as string}`);
			}

			const input = await command.input();

			const parsed = input.safeParse(args);
			if (!parsed.success) {
				throw parsed.error;
			}
			return command.execute({input: parsed.data});
		},
	};
}

export type SpellbookType<TCommands extends Record<string, Command<z.ZodType, any>>> = ReturnType<
	typeof createSpellbook<TCommands>
>;

export class Spellbook<TCommands extends Record<string, Command<z.ZodType, any>>> {
	private commands: TCommands;

	static create() {
		return new Spellbook<Record<never, Command<z.ZodType, any>>>();
	}

	constructor(commands: TCommands = {} as TCommands) {
		this.commands = commands;
	}

	command<TKey extends string, TSchema extends z.ZodType, TReturn>(
		key: TKey,
		command: Command<TSchema, TReturn>,
	) {
		return new Spellbook<TCommands & Record<TKey, Command<TSchema, TReturn>>>({
			...this.commands,
			[key]: command,
		});
	}

	build() {
		return createSpellbook(this.commands);
	}
}
