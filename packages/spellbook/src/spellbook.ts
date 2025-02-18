import type {StandardSchemaV1} from "@standard-schema/spec";
import {factory} from "@usirin/forge";
import type {SpellSpec} from "./types";
import {standardValidate} from "./validate-standard-schema";

export const createSpell = factory(
	"spell",
	<TSchema extends StandardSchemaV1, TReturn>({
		description,
		parameters,
		execute,
	}: SpellSpec<TSchema, TReturn>): SpellSpec<TSchema, TReturn> => ({
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
	<TSpells extends Record<string, SpellSpec>>(spells: TSpells = {} as TSpells) => ({
		spells,
		execute: async <TKey extends keyof TSpells>(
			key: TKey,
			parameters: StandardSchemaV1.InferInput<TSpells[TKey]["parameters"]>,
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

export const createSpellCaster = factory(
	"spellcaster",
	<TSpellbook extends Spellbook>(spellbook: TSpellbook) => ({spellbook}),
);
