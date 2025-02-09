/**
 * Represents a uniquely identifiable entity with a type tag
 *
 * @example
 * type UserEntity = Entity<'user'>;
 * // Result: { tag: 'user', id: 'user_x7f2k...' }
 */
export type Entity<T extends string> = {
	tag: T;
	id: `${T}_${string}`;
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
export const id = <T extends string>(prefix: T): `${T}_${string}` =>
	`${prefix}_${Math.random().toString(36).substring(2, 15)}`;

/**
 * Creates a basic entity with a tag and generated ID
 *
 * @example
 * ```ts
 * const user = entity('user');
 * // Result: { tag: 'user', id: 'user_x7f2k...' }
 * ```
 */
export const entity = <T extends string>(tag: T): Entity<T> => ({
	tag,
	id: id(tag),
});

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
export const factory =
	<T extends string, U, A extends any[]>(tag: T, _factory: (...args: A) => U) =>
	(...args: A): Entity<T> & U => ({
		...entity(tag),
		..._factory(...args),
	});
