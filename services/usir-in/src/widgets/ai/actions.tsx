import {openai} from "@ai-sdk/openai";
import {generateText} from "ai";
import {getMutableAIState} from "ai/rsc";
import type {ReactNode} from "react";
import type {AI} from "./context";

export type ServerMessage = {
	role: "user" | "assistant";
	content: string;
};

export type ClientMessage = {
	id: string;
	role: "user" | "assistant";
	display: ReactNode;
};

export async function sendMessage(content: string) {
	"use server";
	const history = getMutableAIState<typeof AI>();

	history.update([...history.get(), {role: "user", content}]);

	const _response = await generateText({
		model: openai("o1-mini"),
		messages: history.get(),
	});

	_response;

	const response = JSON.parse(JSON.stringify(_response)) as typeof _response;
	console.log("response", response);

	history.done([...history.get(), {role: "assistant", content: response.text}]);

	try {
		return response;
	} catch (error) {
		console.log("Error parsing response:", error);
	}
}
