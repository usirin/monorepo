import fs from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import {input} from "@inquirer/prompts";
import {factory} from "@usirin/forge";
import {type Spell, createSpell} from "@usirin/spellbook";
import chalk from "chalk";
import {z} from "zod";
import {zodToJsonSchema} from "zod-to-json-schema";

export const name = "@usirin/scribe";

console.log({apiKey: process.env.ANTHROPIC_API_KEY});

const createScribe = factory(
	"scribe",
	(client: Anthropic, getUserMessage: () => Promise<string>, spells: Record<string, Spell>) => {
		return {
			client,
			getUserMessage,
			spells,
			runInference(messages: Anthropic.Messages.MessageParam[]) {
				const tools: Anthropic.ToolUnion[] = [];
				for (const [name, spell] of Object.entries(spells)) {
					// @ts-expect-error
					const input_schema = zodToJsonSchema(spell._spec.parameters, name);
					console.log({input_schema});
					tools.push({
						name,
						description: spell._spec.description,
						// @ts-expect-error
						input_schema: input_schema.definitions[name],
					});
				}

				const params: Anthropic.MessageCreateParams = {
					model: "claude-4-sonnet-20250514",
					max_tokens: 2048,
					messages,
					tools,
					thinking: {
						type: "enabled",
						budget_tokens: 1024,
					},
				};

				return client.messages.create(params);
			},
		};
	},
);

export type Scribe = ReturnType<typeof createScribe>;

async function run(scribe: Scribe) {
	console.log("Chat with Claude 4 Sonnet (use Ctrl+C to exit)\n\n");

	const messages: Anthropic.Messages.MessageParam[] = [];
	let hasToolUse = false;

	async function chat() {
		if (!hasToolUse) {
			const userInput = await scribe.getUserMessage();
			if (!userInput) {
				console.log(chalk.red("No input provided, exiting..."));
				return;
			}
			messages.push({role: "user", content: userInput});
		}

		try {
			const response = await scribe.runInference(messages);
			messages.push({role: "assistant", content: response.content});

			const toolResults: Anthropic.ToolResultBlockParam[] = [];
			for await (const content of response.content) {
				switch (content.type) {
					case "text":
						console.log(chalk.yellow("Claude:"), content.text);
						break;
					case "thinking":
						console.log(chalk.gray("💭 Thinking:"), chalk.dim(content.thinking));
						break;
					case "tool_use": {
						console.log(chalk.green("Debug(tool_use):"), content.name, content.input);
						const tool = scribe.spells[content.name];
						const input = content.input;
						const result: Anthropic.ToolResultBlockParam = {
							type: "tool_result",
							tool_use_id: content.id,
							content: await tool(input, {}),
						};
						console.log(chalk.green("Debug(tool_use result):"), result.content);
						toolResults.push(result);
						break;
					}
				}
			}

			if (toolResults.length === 0) {
				hasToolUse = false;
				await chat();
			}
			hasToolUse = true;
			messages.push({role: "user", content: toolResults});
		} catch (error) {
			console.error(chalk.red("Error during inference:"), (error as Error).message);
		}

		await chat();
	}

	await chat();
}

async function main() {
	const anthropic = new Anthropic();
	const scribe = createScribe(
		anthropic,
		// read input
		async () => input({message: chalk.blue("You:")}),
		{
			// @ts-expect-error
			read_file: createSpell({
				description:
					"Read the contents of a given relative file path. Use this when you want to see what's inside a file. Do not use this with directory names.",
				parameters: z.object({filePath: z.string()}),
				result: z.string(),
				context: z.object({}),
				execute: async ({filePath}) => {
					try {
						const content = await Bun.file(filePath).text();
						return content;
					} catch (error) {
						return `Error reading file: ${(error as Error).message}`;
					}
				},
			}),
			// @ts-expect-error
			list_files: createSpell({
				description:
					"Optional relative path to list files from. Defaults to current directory if not provided.",
				parameters: z.object({directoryPath: z.string().optional()}),
				result: z.string(),
				context: z.object({}),
				execute: async ({directoryPath = "."}) => {
					try {
						const entries = await fs.readdir(directoryPath, {withFileTypes: true});

						const formatted = entries
							.map((entry) => {
								const type = entry.isDirectory() ? "📁" : "📄";
								return `${type} ${entry.name}`;
							})
							.join("\n");

						return formatted || "Directory is empty";
					} catch (error) {
						return `Error reading directory: ${(error as Error).message}`;
					}
				},
			}),
		},
	);
	await run(scribe);
}

main().catch((error) => {
	console.error(chalk.red("An error occurred:"), error);
	process.exit(1);
});
