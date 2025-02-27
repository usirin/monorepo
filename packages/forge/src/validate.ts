import type {StandardSchemaV1} from "@standard-schema/spec";

export function validateSync<T extends StandardSchemaV1>(
	schema: T,
	input: StandardSchemaV1.InferInput<T>,
): StandardSchemaV1.InferOutput<T> {
	const result = schema["~standard"].validate(input);
	if (result instanceof Promise) {
		throw new Error("async validation is not supported");
	}

	if (result.issues) {
		throw new Error(JSON.stringify(result.issues, null, 2));
	}

	return result.value;
}

export async function validateAsync<T extends StandardSchemaV1>(
	schema: T,
	input: StandardSchemaV1.InferInput<T>,
): Promise<StandardSchemaV1.InferOutput<T>> {
	let result = schema["~standard"].validate(input);
	if (result instanceof Promise) result = await result;

	if (result.issues) {
		throw new Error(JSON.stringify(result.issues, null, 2));
	}

	return result.value;
}
