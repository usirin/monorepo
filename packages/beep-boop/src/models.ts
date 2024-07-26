import {createAnthropic} from "@ai-sdk/anthropic";
import {createOpenAI} from "@ai-sdk/openai";
import {env} from "./env";

export const anthropic = createAnthropic({
	apiKey: env.ANTHROPIC_API_KEY,
});

export const groq = createOpenAI({
	baseURL: "https://api.groq.com/openai/v1",
	apiKey: env.GROQ_API_KEY,
});
