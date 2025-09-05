// import {query} from "@anthropic-ai/claude-code";
import {Effect, Match, Stream} from "effect";
import {ClaudeCode} from "./ClaudeCode";

const program = Effect.gen(function* () {
	const {query} = yield* ClaudeCode;

	yield* query({
		prompt: "checkout package.json and pnpm-workspace.yaml, and tell me what you think about it",

		options: {
			customSystemPrompt:
				"You are a senior software engineer with expertise in debugging and system analysis. Your task is to investigate the cause of the API downtime and suggest potential fixes.",
			maxTurns: 10,
			permissionMode: "plan",
			allowedTools: ["Read", "Grep", "WebSearch", "LS"],
		},
	}).pipe(
		// Stream.tap((message) => Effect.log(`Received message: ${JSON.stringify(message)}`)),
		Stream.runForEach(
			Effect.fn(function* (input) {
				return Match.value(input).pipe(
					Match.when({type: "result", subtype: "success"}, (message) => {
						console.log("success", message.result);
					}),
					Match.when({type: "user"}, (message) => {
						console.log("user", message.message);
					}),
				);
			}),
		),
	);
});

Effect.runPromise(program.pipe(Effect.provide(ClaudeCode.Default))).catch((error) => {
	console.error("Error running program:", error);
});

// for await (const message of query({
// 	prompt: "checkout package.json and pnpm-workspace.yaml, and tell me what you think about it",
//
// 	options: {
// 		customSystemPrompt:
// 			"You are a senior software engineer with expertise in debugging and system analysis. Your task is to investigate the cause of the API downtime and suggest potential fixes.",
// 		maxTurns: 10,
// 		permissionMode: "plan",
// 		allowedTools: ["Read", "Grep", "WebSearch", "LS"],
// 	},
// })) {
// 	// if (message.type === "result") {
// 	console.log(message);
// 	// }
// }

// for await (const message of query({
// 	prompt: "Refactor this function",
// 	options: {
// 		appendSystemPrompt: "Always include comprehensive error handling and unit tests.",
// 		maxTurns: 2,
// 	},
// })) {
// 	console.log(message);
// }
