import type {StandardSchemaV1 as StandardV1} from "@standard-schema/spec";
import {monotonicFactory} from "ulidx";
import {validateSync} from "./validate";

const ulid = monotonicFactory();

/**
 * Represents a uniquely identifiable entity with a type tag
 *
 * @example
 * type UserEntity = Entity<'user'>;
 * // Result: { tag: 'user', id: 'user_x7f2k...' }
 */
export type Entity<Tag extends string> = {
	tag: Tag;
	id: `${Tag}_${string}`;
};

/**
 * Type helper for referencing an entity by its ID
 *
 * @example
 * type UserEntity = Entity<'user'>;
 * type UserRef = Ref<UserEntity>;
 * // Result: 'user_x7f2k...'
 */
export type Ref<T extends Entity<string>> = T["id"];

/**
 * Generates a unique ID with the given prefix
 *
 * @example
 * ```ts
 * const userId = id('user');
 * // Result: 'user_x7f2k...'
 * ```
 */
export const id = <Tag extends string>(prefix: Tag): `${Tag}_${string}` =>
	`${prefix}_${ulid(Date.now()).toLowerCase()}`;

/**
 * Creates a basic entity with a tag and generated ID
 *
 * @internal
 * @example
 * ```ts
 * const user = entity('user');
 * // Result: { tag: 'user', id: 'user_x7f2k...' }
 * ```
 */
const entity = <T extends string>(tag: T): Entity<T> => ({tag, id: id(tag)});

/**
 * Creates a factory function that produces tagged entities with additional properties.
 * Combines a basic entity (tag + id) with custom properties.
 *
 * @example
 * ```ts
 * // Define a factory for creating users
 * const createUser = factory('user', (name: string, age: number) => ({
 *   name,
 *   age
 * }));
 *
 * // Create a user with the factory
 * const user = createUser('John', 30);
 * // Result: {
 *   tag: 'user',
 *   id: 'user_x7f2k...',
 *   name: 'John',
 *   age: 30
 * }
 * ```
 */
export function factory<Tag extends string, CustomProps, Args extends any[]>(
	tag: Tag,
	customPropsFactory: (...args: Args) => CustomProps,
) {
	return (...args: Args): Entity<Tag> & CustomProps => ({
		...entity(tag),
		...customPropsFactory(...args),
	});
}

type EmptyObject = {[key: string]: any};

/**
 * Creates a factory function that produces tagged entities with additional properties.
 * Combines a basic entity (tag + id) with custom properties.
 *
 * @example
 * ```ts
 * // Define a factory for creating users
 * import {z} from 'zod';
 * import * as v from 'valibot';
 * // with zod
 * const createUser = struct('user', z.object({name: z.string()}));
 *
 * // with valibot
 * const createUser = struct('user', v.object({name: v.string()}));
 *
 * // Create a user with the factory
 * const user = createUser({name: 'John'});
 * // Result: { tag: 'user', id: 'user_x7f2k...', name: 'John' }
 * ```
 */
export function struct<Tag extends string, T extends StandardV1<EmptyObject, EmptyObject>>(
	tag: Tag,
	schema: T,
) {
	return factory(tag, (parameters: StandardV1.InferInput<T>) => {
		const result = validateSync(schema, parameters);
		return result;
	});
}
