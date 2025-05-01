import type {StandardSchemaV1 as StandardV1} from "@standard-schema/spec";
import {standardValidate} from "./validate-standard-schema";

export interface SpellSpec<
	TParamsSchema extends StandardV1,
	TResultSchema extends StandardV1,
	TContextSchema extends StandardV1,
> {
	description: string;
	parameters: TParamsSchema;
	result: TResultSchema;
	context: TContextSchema;
	execute: (
		parameters: StandardV1.InferOutput<TParamsSchema>,
		context: StandardV1.InferOutput<TContextSchema>,
	) => Promise<StandardV1.InferOutput<TResultSchema>>;
}

// Empty object schema for spells that don't need context
export function createSpell<
	TParams extends StandardV1,
	TResult extends StandardV1,
	TContext extends StandardV1,
>(spec: SpellSpec<TParams, TResult, TContext>) {
	const spell = async (
		parameters: StandardV1.InferInput<TParams>,
		context: StandardV1.InferInput<TContext>,
	): Promise<StandardV1.InferOutput<TResult>> => {
		const [validatedParams, validatedContext] = await Promise.all([
			standardValidate(spec.parameters, parameters),
			standardValidate(spec.context, context),
		]);

		const result = await spec.execute(validatedParams, validatedContext);

		const validatedResult = await standardValidate(spec.result, result);

		return validatedResult;
	};

	spell._spec = spec;
	spell._tag = "spell";

	return spell;
}

export type Spell<
	TParamsSchema extends StandardV1 = StandardV1<any, any>,
	TResultSchema extends StandardV1 = StandardV1<any, any>,
	TContextSchema extends StandardV1 = StandardV1<any, any>,
> = {
	(
		parameters: StandardV1.InferInput<TParamsSchema>,
		context: StandardV1.InferOutput<TContextSchema>,
	): Promise<StandardV1.InferOutput<TResultSchema>>;
	_spec: SpellSpec<TParamsSchema, TResultSchema, TContextSchema>;
	_tag: string;
};

// Helper type to extract context type from a Spell
type ContextTypeOf<S> = S extends Spell<any, any, infer C> ? StandardV1.InferInput<C> : never;

// Convert union to intersection (used for deriving combined context type)
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void
	? I
	: never;

// Derive combined context type from a record of spells
export type DerivedContextType<TSpells extends Record<string, Spell<any, any, any>>> =
	UnionToIntersection<ContextTypeOf<TSpells[keyof TSpells]>>;

export function createSpellbook<
	TSpells extends Record<string, Spell<any, any, any>>,
	TContext extends DerivedContextType<TSpells>,
>(spells: TSpells, context: TContext) {
	const wrappedSpells: Record<string, any> = {};

	for (const spellName in spells) {
		const originalSpell = spells[spellName];

		// Create a wrapped spell that automatically provides the context
		const wrappedSpell = async (parameters: any): Promise<any> => {
			return originalSpell(parameters, context);
		};

		// Preserve the spell metadata
		wrappedSpell._spec = originalSpell._spec;
		wrappedSpell._tag = originalSpell._tag;

		wrappedSpells[spellName] = wrappedSpell;
	}

	return wrappedSpells as Spellbook<TSpells, TContext>;
}

export type Spellbook<
	TSpells extends Record<string, Spell<any, any, any>> = Record<string, Spell<any, any, any>>,
	TContext = DerivedContextType<TSpells>,
> = {
	[K in keyof TSpells]: (parameters: Parameters<TSpells[K]>[0]) => ReturnType<TSpells[K]>;
} & {
	_context: TContext;
};
