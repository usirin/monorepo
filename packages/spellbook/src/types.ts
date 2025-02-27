import type {StandardSchemaV1} from "@standard-schema/spec";

export interface SpellSpec<
	TSchema extends StandardSchemaV1 = StandardSchemaV1<any, any>,
	TReturn = any,
> {
	description: string;
	parameters: TSchema;
	execute: (parameters: StandardSchemaV1.InferOutput<TSchema>) => Promise<TReturn>;
}
