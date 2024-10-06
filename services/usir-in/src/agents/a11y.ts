import type {CoreMessage} from "ai";
import {match} from "ts-pattern";
import {createActor, fromTransition, setup} from "xstate";

type AgentEvent = {type: "agent.message"; message: CoreMessage} | {type: "agent.reset"};

type AgentState = {messages: CoreMessage[]};

const machine = setup({
	types: {
		context: {} as AgentState,
		events: {} as AgentEvent,
	},
});
