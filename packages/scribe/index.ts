import {
	HttpMiddleware,
	HttpRouter,
	HttpServer,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform";
import {BunHttpServer, BunRuntime} from "@effect/platform-bun";
import {Effect, Layer, Match, Schema} from "effect";
import {Discord, DiscordInteraction} from "./Discord";
import {
	InteractionResponseFlags,
	InteractionResponseType,
	InteractionType,
	MessageComponentTypes,
} from "discord-interactions";

const verifyDiscordRequest = HttpMiddleware.make((app) =>
	Effect.gen(function* () {
		const req = yield* HttpServerRequest.HttpServerRequest;

		const body = yield* req.text;

		const signature = req.headers["x-signature-ed25519"];
		const timestamp = req.headers["x-signature-timestamp"];

		if (!signature || !timestamp) {
			return HttpServerResponse.text("Bad request").pipe(HttpServerResponse.setStatus(401));
		}

		const discord = yield* Discord;

		const isValid = yield* discord
			.verifyKey({body, signature, timestamp})
			// If there's an error during verification, treat it as invalid
			.pipe(Effect.catchAll(() => Effect.succeed(false)));

		if (!isValid) {
			return HttpServerResponse.text("Bad request").pipe(HttpServerResponse.setStatus(401));
		}

		return yield* app;
	}),
);

// Define the router with a single route for the root URL
const router = HttpRouter.empty.pipe(
	HttpRouter.get("/", HttpServerResponse.text("Hello World")),
	HttpRouter.get("/umut", HttpServerResponse.text("Hello umut").pipe(verifyDiscordRequest)),
	HttpRouter.post(
		"/interactions",
		verifyDiscordRequest(
			Effect.gen(function* () {
				const req = yield* HttpServerRequest.HttpServerRequest;
				yield* Effect.log("Received a discord interaction", yield* req.json);

				// Parse the request body using our schema
				const interaction = yield* HttpServerRequest.schemaBodyJson(DiscordInteraction);
				yield* Effect.log("Parsed interaction:", interaction);

				const response = Match.value(interaction).pipe(
					Match.when({type: InteractionType.PING}, () => ({
						type: InteractionResponseType.PONG as const,
					})),
					Match.when({type: InteractionType.APPLICATION_COMMAND}, function (cmd) {
						const handlers = {
							test: () => ({
								type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE as const,
								data: {
									flags: InteractionResponseFlags.IS_COMPONENTS_V2,
									components: [
										{
											type: MessageComponentTypes.TEXT_DISPLAY,
											content: `You invoked the command: ${cmd.data.name}`,
										},
									],
								},
							}),
						};

						return handlers[cmd.data.name as keyof typeof handlers]();
					}),
					Match.orElse((a) => Effect.fail(new Error(`Unknown interaction type: ${a.type}`))),
				);

				yield* Effect.logError(`Unknown interaction type: ${interaction.type}`);
				return yield* HttpServerResponse.json(response);
			}),
		),
	),
);

// Set up the application server with logging
const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress);

// Specify the port
const port = 3000;

// Create a server layer with the specified port
const ServerLive = Layer.mergeAll(BunHttpServer.layer({port}), Discord.Default);

// Run the application
BunRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)));
