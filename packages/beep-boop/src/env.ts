import {parseEnv} from "znv";
import {z} from "zod";

export const env = parseEnv(process.env, {
	ANTHROPIC_API_KEY: z.string(),
	GROQ_API_KEY: z.string(),
});
