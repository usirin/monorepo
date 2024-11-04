import {enableMapSet, produce} from "immer";
import {assign, createActor, setup} from "xstate";
import {stringify} from "./syntax-vim";

enableMapSet();

interface RunekeeperContext {
	buffer: string[];
	keymap: Map<string, Map<string, () => void>>; // Mode -> (Sequence -> Command)
	history: string[];
}

type RunekeeperEvent<TMode extends string> =
	| {type: "KEY_PRESS"; key: string; mode: TMode}
	| {type: "MAP"; mode: TMode; sequence: string; command: () => void}
	| {type: "UNMAP"; mode: TMode; sequence: string};

export const createRunekeeperMachine = <TMode extends string>(modes: TMode[]) => {
	return setup({
		types: {} as {
			context: RunekeeperContext;
			events: RunekeeperEvent<TMode>;
		},
		guards: {
			hasMappedCommand: ({context, event}) => {
				if (event.type !== "KEY_PRESS") return false;

				const modeKeys = context.keymap.get(event.mode);
				const nextBuffer = context.buffer.concat(event.key).join("");
				return !!modeKeys?.has(nextBuffer);
			},
		},
		actions: {
			clearBuffer: assign({buffer: []}),
			appendToBuffer: assign({
				buffer: ({context, event}) =>
					event.type === "KEY_PRESS" ? [...context.buffer, event.key] : context.buffer,
			}),
			executeCommand: assign({
				history: ({context, event}) =>
					produce(context.history, (draft) => {
						if (event.type === "KEY_PRESS") {
							const sequence = context.buffer.join("");
							const command = context.keymap.get(event.mode)?.get(sequence);
							if (command) {
								draft.push(sequence);
								command();
							}
						}
					}),
				buffer: [], // Clear the buffer after executing a command
			}),
			mapKey: assign({
				keymap: ({context, event}) =>
					produce(context.keymap, (draft) => {
						if (event.type === "MAP") {
							if (!draft.has(event.mode)) {
								draft.set(event.mode, new Map());
							}
							const modeMap = draft.get(event.mode);
							if (modeMap) {
								modeMap.set(event.sequence, event.command);
							}
						}
					}),
			}),
			unmapKey: assign({
				keymap: ({context, event}) =>
					produce(context.keymap, (draft) => {
						if (event.type === "UNMAP") {
							const modeMap = draft.get(event.mode);
							if (modeMap) {
								modeMap.delete(event.sequence);
							}
						}
					}),
			}),
		},
	}).createMachine({
		id: "runekeeper",
		initial: "idle",
		context: {
			buffer: [],
			keymap: new Map(modes.map((mode) => [mode, new Map()])),
			history: [],
		},
		states: {
			idle: {
				on: {
					KEY_PRESS: [
						{
							guard: "hasMappedCommand",
							target: "idle",
							actions: ["appendToBuffer", "executeCommand"],
						},
						{
							target: "buffering",
							actions: "appendToBuffer",
						},
					],
					MAP: {
						actions: "mapKey",
					},
					UNMAP: {
						actions: "unmapKey",
					},
				},
			},
			buffering: {
				after: {
					1000: {
						target: "idle",
						actions: ["executeCommand", "clearBuffer"],
					},
				},
				on: {
					KEY_PRESS: [
						{
							guard: "hasMappedCommand",
							target: "idle",
							actions: ["appendToBuffer", "executeCommand"],
						},
						{
							target: "buffering",
							actions: "appendToBuffer",
							reenter: true,
						},
					],
				},
			},
		},
	});
};

export function createRunekeeper<TMode extends string>(modes: TMode[]) {
	const runekeeperMachine = createRunekeeperMachine(modes);
	const runekeeperActor = createActor(runekeeperMachine);

	runekeeperActor.start();

	return {
		machine: runekeeperMachine,
		actor: runekeeperActor,
		map: (mode: TMode, sequence: string, command: () => void) => {
			runekeeperActor.send({type: "MAP", mode, sequence, command});
		},
		unmap: (mode: TMode, sequence: string) => {
			runekeeperActor.send({type: "UNMAP", mode, sequence});
		},
		handleKeyPress: (event: KeyboardEvent, mode: TMode) => {
			runekeeperActor.send({type: "KEY_PRESS", key: stringify(event), mode});
		},
		getSnapshot: () => runekeeperActor.getSnapshot(),
		subscribe: runekeeperActor.subscribe,
	};
}
