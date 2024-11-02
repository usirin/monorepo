import type {z} from "zod";

export type CommandHandler<T extends z.ZodType> = (args: z.infer<T>) => Promise<void> | void;

export type InferCommandInput<T> = T extends Command<infer S> ? z.infer<S> : never;

export interface Command<TSchema extends z.ZodType> {
	description: string;
	input: TSchema;
	execute: (args: z.infer<TSchema>) => void;
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
		execute: <TKey extends keyof TCommands>(key: TKey, args: z.infer<TCommands[TKey]["input"]>) => {
			const command = commands[key];
			if (!command) {
				throw new Error(`Command not found: ${key as string}`);
			}
			if (!command.input.safeParse(args).success) {
				throw new Error("Invalid arguments");
			}
			command.execute(args);
		},
	};
}
