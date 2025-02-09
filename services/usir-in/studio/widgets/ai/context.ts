import {createAI} from "ai/rsc";
import {type ClientMessage, type ServerMessage, sendMessage} from "./actions";

export type AIState = ServerMessage[];
export type UIState = ClientMessage[];

export const AI = createAI<AIState, UIState>({
	initialAIState: [],
	initialUIState: [],
	actions: {
		sendMessage,
	},
});
