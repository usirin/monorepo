import * as ai from "ai/rsc";
import {type ClientMessage, type ServerMessage, sendMessage} from "./actions";

console.log(ai);

export type AIState = ServerMessage[];
export type UIState = ClientMessage[];

export const ChatAIContext = ai.createAI<AIState, UIState>({
	initialAIState: [],
	initialUIState: [],
	actions: {
		sendMessage,
	},
});
