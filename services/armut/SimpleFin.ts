import {FetchHttpClient, HttpClient, HttpClientRequest, HttpClientResponse} from "@effect/platform";
import {Data, Effect, Redacted, Schema} from "effect";
import {Environment} from "./Environment";

export class SimpleFinError extends Data.TaggedError("SimpleFinError")<{
	cause: unknown;
}> {}

export class SimpleFinAuthError extends Data.TaggedError("SimpleFinAuthError")<{
	message: string;
}> {}

export class SimpleFinTransaction extends Schema.Class<SimpleFinTransaction>(
	"SimpleFinTransaction",
)({
	id: Schema.String,
	posted: Schema.Number,
	amount: Schema.String,
	description: Schema.String,
	memo: Schema.optional(Schema.String),
	transacted_at: Schema.optional(Schema.Number),
	pending: Schema.optional(Schema.Boolean),
	extra: Schema.optional(Schema.Record({key: Schema.String, value: Schema.String})),
}) {}

export class SimpleFinOrganization extends Schema.Class<SimpleFinOrganization>(
	"SimpleFinOrganization",
)({
	domain: Schema.optional(Schema.String),
	"sfin-url": Schema.String,
	name: Schema.optional(Schema.String),
	url: Schema.optional(Schema.String),
	id: Schema.optional(Schema.String),
}) {}

export class SimpleFinAccount extends Schema.Class<SimpleFinAccount>("SimpleFinAccount")({
	org: SimpleFinOrganization,
	id: Schema.String,
	name: Schema.String,
	currency: Schema.String,
	balance: Schema.String,
	"available-balance": Schema.optional(Schema.String),
	"balance-date": Schema.Number,
	transactions: Schema.optional(Schema.Array(SimpleFinTransaction)),
	extra: Schema.optional(Schema.Record({key: Schema.String, value: Schema.String})),
}) {}

export class SimpleFinAccountSet extends Schema.Class<SimpleFinAccountSet>("SimpleFinAccountSet")({
	accounts: Schema.Array(SimpleFinAccount),
	errors: Schema.optional(Schema.Array(Schema.String)),
}) {}

export class SimpleFin extends Effect.Service<SimpleFin>()("SimpleFin", {
	dependencies: [Environment.Default, FetchHttpClient.layer],
	effect: Effect.gen(function* () {
		yield* Effect.log("SimpleFin service initialized");

		const {SIMPLEFIN_TOKEN, SIMPLEFIN_ACCESS_URL} = yield* Environment;
		const http = HttpClient.filterStatusOk(yield* HttpClient.HttpClient);

		const getAccessURL = Effect.fn("SimpleFin.getAccessURL")(function* () {
			if (Redacted.value(SIMPLEFIN_ACCESS_URL) !== "") {
				yield* Effect.log("SIMPLEFIN_URL is set, using it directly");
				return Schema.decodeSync(Schema.URL)(Redacted.value(SIMPLEFIN_ACCESS_URL));
			}
			const claimUrl = yield* Effect.try({
				try: () => Buffer.from(Redacted.value(SIMPLEFIN_TOKEN), "base64").toString("utf-8"),
				catch: (cause) =>
					new SimpleFinAuthError({message: `Failed to parse SimpleFin token: ${cause}`}),
			}).pipe(Effect.map(Schema.decodeSync(Schema.URL)));

			yield* Effect.log(`SimpleFin claim URL: ${claimUrl}`);

			return yield* http.post(claimUrl).pipe(
				Effect.flatMap((resp) => resp.text),
				Effect.map(Schema.decodeSync(Schema.URL)),
			);
		});

		const accessUrl = yield* getAccessURL();

		const httpWithAuth = http.pipe(
			HttpClient.mapRequest(
				HttpClientRequest.basicAuth(
					Redacted.make(accessUrl.username),
					Redacted.make(accessUrl.password),
				),
			),
		);

		const getAccounts = (options?: {
			startDate?: number;
			endDate?: number;
			pending?: boolean;
			account?: string;
			balancesOnly?: boolean;
		}): Effect.Effect<SimpleFinAccountSet, SimpleFinError> =>
			Effect.gen(function* () {
				yield* Effect.log(`SimpleFin access URL: ${accessUrl}`);

				const url = new URL(`${accessUrl}/accounts`);
				yield* Effect.log(`SimpleFin access URL: ${url}`);

				if (options?.startDate) url.searchParams.set("start-date", String(options.startDate));
				if (options?.endDate) url.searchParams.set("end-date", String(options.endDate));
				if (options?.pending !== undefined)
					url.searchParams.set("pending", String(options.pending));
				if (options?.account) url.searchParams.set("account", options.account);
				if (options?.balancesOnly) url.searchParams.set("balances-only", "true");

				const result = yield* httpWithAuth.get(url).pipe(
					Effect.flatMap(HttpClientResponse.schemaBodyJson(SimpleFinAccountSet)),
					Effect.catchAll((cause) => Effect.fail(new SimpleFinError({cause}))),
				);

				return result;
			});

		return {
			getAccounts,
		};
	}),
}) {}
