export type Entity<T extends string> = {
	tag: T;
	id: `${T}:${string}`;
};

export type Ref<T extends Entity<string>> = T["id"];

export const id = <T extends string>(prefix: T): `${T}:${string}` =>
	`${prefix}:${Math.random().toString(36).substring(2, 15)}`;

export const entity = <T extends string>(tag: T): Entity<T> => ({
	tag,
	id: id(tag),
});

export const factory =
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		<T extends string, U, A extends any[]>(tag: T, _factory: (...args: A) => U) =>
		(...args: A): Entity<T> & U => ({
			...entity(tag),
			..._factory(...args),
			clone() {
				return factory(tag, _factory)(...args);
			},
		});
