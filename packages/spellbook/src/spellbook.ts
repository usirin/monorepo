import type {StandardSchemaV1} from "@standard-schema/spec";
import {factory} from "@usirin/forge";
import {standardValidate} from "./validate-standard-schema";

export interface SpellDescription<
	TSchema extends StandardSchemaV1 = StandardSchemaV1<any, any>,
	TReturn = any,
> {
	description: string;
	parameters: TSchema;
	execute: (parameters: StandardSchemaV1.InferOutput<TSchema>) => Promise<TReturn>;
}

export const createSpell = factory(
	"spell",
	<TSchema extends StandardSchemaV1, TReturn>({
		description,
		parameters,
		execute,
	}: SpellDescription<TSchema, TReturn>): SpellDescription<TSchema, TReturn> => ({
		description,
		parameters,
		execute: async (params: StandardSchemaV1.InferInput<TSchema>) => {
			const validated = await standardValidate(parameters, params);
			return execute(validated);
		},
	}),
);

export type Spell<
	TSchema extends StandardSchemaV1 = StandardSchemaV1<any, any>,
	TReturn = any,
> = ReturnType<typeof createSpell<TSchema, TReturn>>;

export const createSpellbook = factory(
	"spellbook",
	<TSpells extends Record<string, SpellDescription>>(spells: TSpells = {} as TSpells) => ({
		spells,
		execute: async <TKey extends keyof TSpells>(
			key: TKey,
			parameters?: StandardSchemaV1.InferInput<TSpells[TKey]["parameters"]>,
		): Promise<ReturnType<TSpells[TKey]["execute"]>> => {
			const spell = spells[key];
			if (!spell) {
				throw new Error(`Spell not found: ${key as string}`);
			}

			return spell.execute(parameters);
		},
	}),
);

export type Spellbook = ReturnType<typeof createSpellbook>;
