import {type Tree, createTree} from "@umut/layout-tree";
import {createStoreWithProducer} from "@xstate/store";
import {produce} from "immer";
import {type ActorRefFrom, createActor, setup, stopChild} from "xstate";
import {create} from "zustand";
import xstate from "zustand-middleware-xstate";

const modeMachine = setup({
	types: {
		events: {} as {type: "COMMAND"} | {type: "NORMAL"} | {type: "ESC"},
	},
}).createMachine({
	id: "mode",
	initial: "normal",
	states: {
		normal: {
			on: {
				COMMAND: {
					target: "command",
				},
			},
		},
		command: {
			on: {
				NORMAL: {
					target: "normal",
				},
				ESC: {
					target: "normal",
				},
			},
		},
	},
});

const useModeMachine = create(xstate(modeMachine));

export const useModeState = () => {
	const {state, send, actor} = useModeMachine();
	if (!state || !send || !actor) {
		throw new Error("Something went wrong");
	}

	return {state, send, actor};
};

const studioStore = createStoreWithProducer(produce, {
	context: {
		focused: [] as string[],
		layout: createTree(),
	},
	on: {
		FOCUS: (context, event: {path: string[]}) => {
			context.focused = event.path;
		},
	},
});
