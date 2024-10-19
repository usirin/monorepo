import type {z} from "zod";

export interface Command<TName extends string, TSchema extends z.ZodType> {
	name: TName;
	description: string;
	parameters: TSchema;
	execute: (args: z.infer<TSchema>) => void;
}

export function command<TName extends string, TSchema extends z.ZodType>({
	name,
	description,
	parameters,
	execute,
}: {
	name: TName;
	description: string;
	parameters: TSchema;
	execute: (args: z.infer<TSchema>) => void;
}) {
	return {name, description, parameters, execute};
}
