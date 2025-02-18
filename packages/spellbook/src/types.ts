import type {StandardSchemaV1} from "@standard-schema/spec";
import type {Spell, Spellbook} from "./spellbook";

export interface SpellSpec<
	TSchema extends StandardSchemaV1 = StandardSchemaV1<any, any>,
	TReturn = any,
> {
	description: string;
	parameters: TSchema;
	execute: (parameters: StandardSchemaV1.InferOutput<TSchema>) => Promise<TReturn>;
}
/**
 * Core protocol types for spellbook
 */

/**
 * Request to execute a spell
 */
export type SpellbookRequest<
	TSpells extends Record<string, SpellSpec> = Record<string, SpellSpec>,
> = {
	/** Unique identifier for the request */
	id: string;
	/** Name of the spell to execute */
	spell: keyof TSpells;
	/** Parameters for the spell execution */
	parameters: StandardSchemaV1.InferInput<TSpells[keyof TSpells]["parameters"]>;
};

/**
 * Response from spell execution
 */
export type SpellbookResponse<
	TSpells extends Record<string, SpellSpec> = Record<string, SpellSpec>,
> = {
	/** Matching id from the request */
	id: string;
	/** Result of successful spell execution */
	result?: Awaited<ReturnType<TSpells[keyof TSpells]["execute"]>>;
	/** Error details if spell execution failed */
	error?: SpellError;
};

/**
 * Error details for failed spell execution
 */
export type SpellError = {
	/** Error message */
	message: string;
	/** Optional error code */
	code?: string;
	/** Optional additional details */
	details?: unknown;
};

/**
 * Transport interface for spell communication
 */
export type Transport<TSpells extends Record<string, SpellSpec> = Record<string, SpellSpec>> = {
	/** Stream for writing spell requests */
	input: WritableStream<SpellbookRequest<TSpells>>;
	/** Stream for reading spell responses */
	output: ReadableStream<SpellbookResponse<TSpells>>;
};
