"use server";

import {openai} from "@ai-sdk/openai";
import {generateText} from "ai";
import {getAIState} from "ai/rsc";
import type {ReactNode} from "react";

export type ServerMessage = {
	role: "user" | "assistant";
	content: string;
};

export type ClientMessage = {
	id: string;
	role: "user" | "assistant";
	display: ReactNode;
};

export async function sendMessage(input: string) {
	const history = getAIState();

	const response = await generateText({
		model: openai("o1-mini"),
		// @ts-expect-error
		messages: [...history, {role: "user", content: input}],
	});

	return response;
}
