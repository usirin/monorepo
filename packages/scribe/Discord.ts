import * as Api from "discord-interactions";
import {Data, Effect, Redacted, Schema} from "effect";
import {Env} from "./Env";
import {ApplicationCommandType, RouteBases} from "discord-api-types/v10";
import {REST} from "@discordjs/rest";

const PingInteraction = Schema.Struct({
	type: Schema.Literal(Api.InteractionType.PING),
});

const ApplicationCommandInteraction = Schema.Struct({
	type: Schema.Literal(Api.InteractionType.APPLICATION_COMMAND),
	application_id: Schema.String,
	guild_id: Schema.String.pipe(Schema.optional),
	data: Schema.Struct({
		id: Schema.String,
		type: Schema.Enums(ApplicationCommandType).pipe(Schema.optional),
		name: Schema.String,
	}),
});

export const DiscordInteraction = Schema.Union(PingInteraction, ApplicationCommandInteraction);

export class DiscordError extends Data.TaggedError("DiscordError")<{
	method: string;
	cause: unknown;
}> {}

export class Discord extends Effect.Service<Discord>()("Discord", {
	dependencies: [Env.Default],
	scoped: Effect.gen(function* () {
		yield* Effect.log("Discord service initialized");
		const env = yield* Env;
		const DISCORD_PUBLIC_KEY = Redacted.value(env.DISCORD_PUBLIC_KEY);
		const DISCORD_BOT_TOKEN = Redacted.value(env.DISCORD_BOT_TOKEN);

		const isValidKey = Effect.fn("Discord.verifyKey")(
			({body, signature, timestamp}: {body: string; signature: string; timestamp: string}) =>
				Effect.tryPromise({
					try: () => Api.verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY),
					catch: (cause) => new DiscordError({cause, method: "Discord.verifyKey"}),
				}),
		);

		type FetchOptions = Omit<RequestInit, "headers" | "body"> & {body?: Record<string, any>};

		const rest = new REST({version: "10"}).setToken(DISCORD_BOT_TOKEN);

		const use = Effect.fn("Discord.use")(
			<A>(f: (rest: REST, signal: AbortSignal) => Promise<A>): Effect.Effect<A, DiscordError> => {
				return Effect.tryPromise({
					try: (signal) => f(rest, signal),
					catch: (cause) => new DiscordError({method: "Discord.use", cause}),
				});
			},
		);

		const request = Effect.fn("Discord.request")(
			<A = unknown>(endpoint: string, {body, ...options}: FetchOptions = {}) => {
				console.log(`Making request to ${RouteBases.api + endpoint} with options:`, {
					body,
					...options,
				});
				return Effect.tryPromise({
					try: () =>
						DiscordRequest(
							RouteBases.api + endpoint,
							{
								method: "POST",
								...options,
								body: body ? JSON.stringify(body) : undefined,
							},
							DISCORD_BOT_TOKEN,
						).then(async (res) => ({status: res.status, data: (await res.json()) as A})),
					catch: (cause) => new DiscordError({cause, method: "Discord.request"}),
				});
			},
		);

		return {
			verifyKey: isValidKey,
			request,
			use,
		};
	}),
}) {}

async function DiscordRequest(url: string, options: Omit<RequestInit, "headers">, token: string) {
	// append endpoint to root API URL
	// Use fetch to make requests
	const res = await fetch(url, {
		headers: {
			Authorization: `Bot ${token}`,
			"Content-Type": "application/json; charset=UTF-8",
			"User-Agent": "ScribeBot (https://github.com/usirin/scribe-bot, 1.0.0)",
		},
		...options,
	});
	// throw API errors
	if (!res.ok) {
		const data = await res.json();
		console.log(res.status);
		throw new Error(JSON.stringify(data));
	}
	// return original response
	return res;
}
