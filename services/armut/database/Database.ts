import {PgClient} from "@effect/sql-pg";
import {Effect, identity, Layer, String as Str} from "effect";
import {Environment} from "../Environment";

export const PgLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const env = yield* Environment;
		return PgClient.layer({
			url: env.DATABASE_URL,
			transformQueryNames: Str.camelToSnake,
			transformResultNames: Str.snakeToCamel,
			types: {
				114: {to: 25, from: [114], parse: identity, serialize: identity},
				1082: {to: 25, from: [1082], parse: identity, serialize: identity},
				1114: {to: 25, from: [1114], parse: identity, serialize: identity},
				1184: {to: 25, from: [1184], parse: identity, serialize: identity},
				3802: {to: 25, from: [3802], parse: identity, serialize: identity},
			},
		});
	}),
).pipe(Layer.provide(Environment.Default));
