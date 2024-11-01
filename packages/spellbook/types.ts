import type {z} from "zod";

export type CommandHandler<T extends z.ZodType> = (args: z.infer<T>) => Promise<void> | void;

export interface CommandDef<T extends z.ZodTypeAny = z.ZodTypeAny> {
	schema: T;
	handler: CommandHandler<T>;
	description?: string;
}

export type InferCommandInput<T> = T extends CommandDef<infer S> ? z.infer<S> : never;

// This will be augmented by users
declare global {
	// biome-ignore lint/suspicious/noEmptyInterface: This is meant to be augmented
	interface Commands {}
}
