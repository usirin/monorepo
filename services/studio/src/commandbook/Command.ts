import type * as Effect from "effect/Effect";
import {dual} from "effect/Function";
import type * as Schema from "effect/Schema";

export interface Command<P, A, E, R, Name extends string = string> {
	readonly _tag: "Command";
	readonly name: Name;
	readonly description?: string;
	readonly parameters: P;
	readonly execute: (params: Schema.Schema.Type<P>) => Effect.Effect<A, E, R>;
}

export type NameOf<C> = C extends {name: infer N} ? (N extends string ? N : never) : never;

export type AnyCommand = Command<any, any, any, any, any>;

export type CommandsToRecord<T extends readonly AnyCommand[]> = {
	[K in T[number] as NameOf<K>]: K;
};

export type ParamsOf<C> = C extends Command<infer P, any, any, any, any>
	? Schema.Schema.Type<P>
	: never;

export const make = <P, A, E, R, Name extends string>(
	name: Name,
	parameters: P,
	execute: (params: Schema.Schema.Type<P>) => Effect.Effect<A, E, R>,
): Command<P, A, E, R, Name> => ({
	_tag: "Command",
	name,
	parameters,
	execute,
});

export const execute: {
	<P>(
		params: Schema.Schema.Type<P>,
	): <A, E, R, N extends string>(cmd: Command<P, A, E, R, N>) => Effect.Effect<A, E, R>;
	<P, A, E, R, N extends string>(
		cmd: Command<P, A, E, R, N>,
		params: Schema.Schema.Type<P>,
	): Effect.Effect<A, E, R>;
} = dual(2, <P, A, E, R>(cmd: Command<P, A, E, R>, params: Schema.Schema.Type<P>) => {
	return cmd.execute(params);
});
