"use server";

import {createOpenAI} from "@ai-sdk/openai";
import {generateText, streamText, tool} from "ai";
import {createStreamableValue} from "ai/rsc";
import {getEnv} from "waku";
import {z} from "zod";

const openai = createOpenAI({
	apiKey: getEnv("OPENAI_API_KEY"),
});

const generateSystemPrompt = () => {
	return `
You are an assistant who will correct web accessibility issues of a provided website.
I will provide you with an incorrect line of HTML. Provide a correction.
When you see an image text without an alt text, try to describe the image from the url.


Here are a few examples:

E.g.
Incorrect: [['<h3></h3>', '<h3></h3>']]
Issue: There must be some form of text between heading tags.
Correct: [['<h3>Some heading text</h3>', '<h3>Some heading text</h3>']]

Incorrect: [['<img src="image.png">', '<img src="image.png">']]
Issue: The images lack an alt description.
Correct: [['<img src="image.png" alt="Description">', '<img src="image.png" alt="Description">']]

Incorrect: [['<a href=""></a>', '<a href=""></a>']]
Correct: [['<a href="url">Link text</a>', '<a href="url">Link text</a>']]

Incorrect: [['<div id="accessibilityHome">\n<a aria-label="Accessibility overview" href="https://explore.zoom.us/en/accessibility">Accessibility Overview</a>\n</div>']]
Issue: The links are empty and have no URL or text description.
Correct: [['<div id="accessibilityHome" role="navigation">\n<a aria-label="Accessibility overview" href="https://explore.zoom.us/en/accessibility">Accessibility Overview</a>\n</div>']]
	`;
};

export async function generate(input: string) {
	"use server";

	const stream = createStreamableValue("");

	const {text} = await generateText({
		model: openai("gpt-4o"),
		maxTokens: 1024,
		maxToolRoundtrips: 3,
		tools: {
			describeImage: tool({
				description: "Describes the image from the url",
				parameters: z.object({
					value: z.string().describe("The url of the image"),
				}),
				execute: async ({value}) => {
					console.log({value});
					const {text} = await generateText({
						model: openai("gpt-4-turbo"),
						maxTokens: 128,
						system:
							"You are an assistant who describes the image from the url. Always use 1 sentence to describe images, use a concise language",
						messages: [
							{
								role: "user",
								content: [
									{type: "text", text: "describe the image"},
									{type: "image", image: new URL(value)},
								],
							},
						],
					});
					console.log({text});

					return text;
				},
			}),
		},
		system: generateSystemPrompt(),
		prompt: `[['<img src="https://user-images.githubusercontent.com/8138047/148607981-4ec8fee9-d741-4909-ace3-985a1524ebdf.png" class="sc-bBHxTw iGgvYs">']]`,
	});

	// console.log({result: JSON.stringify(result, null, 2)});

	// for await (const delta of textStream) {
	// 	console.log({delta});
	// 	stream.update(delta);
	// }

	console.log({text});

	stream.update(text);
	stream.done();

	return {output: stream.value};
}
