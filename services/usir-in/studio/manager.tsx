import {Context, Effect, Layer} from "effect";
import type z from "zod";

interface Command<TSchema extends z.ZodType> {
	description: string;
	input: TSchema;
	execute: (args: z.infer<TSchema>) => void;
}

// class Spellbook extends Effect.Service<Spellbook>()("@umut/spellbook", {
// 	effect: Effect.gen(function)
// }) {}
//
// }
