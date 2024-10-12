import {type Tree, createTree} from "@umut/layout-tree";
import {type ActorRefFrom, setup} from "xstate";
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

const workspaceMachine = setup({
	types: {
		context: {} as {
			focused: string[];
			layout: Tree;
		},
		input: {} as {
			layout: Tree;
		},
	},
}).createMachine({
	id: "workspace",
	context: ({input}) => ({
		focused: [],
		layout: input.layout,
	}),
});

const studioMachine = setup({
	types: {
		context: {} as {
			mode: ActorRefFrom<typeof modeMachine>;
			workspaces: ActorRefFrom<typeof workspaceMachine>[];
		},
	},
}).createMachine({
	id: "studio",
	context: ({spawn}) => ({
		mode: spawn(modeMachine),
		workspaces: [spawn(workspaceMachine, {input: {layout: createTree()}})],
	}),
});

export const useStudioState = create(xstate(studioMachine));
