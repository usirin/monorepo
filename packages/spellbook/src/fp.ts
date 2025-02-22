import type {StandardSchemaV1 as StandardV1} from "@standard-schema/spec";
import {factory} from "@usirin/forge";

export interface SpellSpec<TSchema extends StandardV1 = StandardV1<any, any>, TReturn = any> {
	description: string;
	parameters: TSchema;
	execute: (parameters: StandardV1.InferOutput<TSchema>) => Promise<TReturn>;
}

export const createSpell = factory(
	"spell",
	<TSchema extends StandardV1, TReturn>(spec: SpellSpec<TSchema, TReturn>) => spec,
);

export type Spell<TSchema extends StandardV1 = StandardV1<any, any>, TReturn = any> = ReturnType<
	typeof createSpell<TSchema, TReturn>
>;

export const createSpellbook = factory(
	"spellbook",
	<TSpells extends Record<string, SpellSpec>>(spells: TSpells = {} as TSpells) => ({
		spells,
	}),
);

export type Spellbook = ReturnType<typeof createSpellbook>;
