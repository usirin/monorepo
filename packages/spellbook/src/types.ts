import type {StandardSchemaV1 as StandardV1} from "@standard-schema/spec";

export interface SpellSpec<
	TParamsSchema extends StandardV1,
	TResultSchema extends StandardV1,
	TContextSchema extends StandardV1,
> {
	description: string;
	parameters: TParamsSchema;
	result: TResultSchema;
	context?: TContextSchema;
	execute: (
		parameters: StandardV1.InferOutput<TParamsSchema>,
		context: StandardV1.InferOutput<TContextSchema>,
	) => Promise<StandardV1.InferOutput<TResultSchema>>;
}
