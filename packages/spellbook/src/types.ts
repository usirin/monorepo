import type {StandardSchemaV1 as StandardV1} from "@standard-schema/spec";
export interface SpellSpec<TParamsSchema extends StandardV1, TResultSchema extends StandardV1> {
	description: string;
	parameters: TParamsSchema;
	result: TResultSchema;
	execute: (
		parameters: StandardV1.InferOutput<TParamsSchema>,
	) => Promise<StandardV1.InferOutput<TResultSchema>>;
}
