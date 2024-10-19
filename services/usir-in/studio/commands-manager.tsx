import {createStoreWithProducer} from "@xstate/store";
import {produce} from "immer";
import {z} from "zod";
import {type Command, command} from "./command";

const Commands = {
	focus: command({
		name: "focus",
		description: "Focus on a specific path in the workspace",
		parameters: z.object({
			path: z.array(z.number()),
		}),
		execute: ({path}) => {
			// foo bar
		},
	}),
	"window.split": command({
		name: "window.split",
		description: "Split the focused window into two",
		parameters: z.object({
			direction: z.enum(["horizontal", "vertical"]).default("horizontal"),
		}),
		execute: ({direction}) => {
			// foo bar
		},
	}),
} as const;

export const store = createStoreWithProducer(produce, {
	context: {
		commands: {} as Record<string, Command<string, z.ZodType>>,
	},
	on: {
		register: (context, event: {command: Command<string, z.ZodType>}) => {
			context.commands[event.command.name] = event.command;
		},
		unregister: (context, event: {name: string}) => {
			delete context.commands[event.name];
		},

		execute: (
			context,
			event: {command: Command<string, z.ZodType>; input: z.infer<typeof event.command.parameters>},
		) => {
			context.commands[event.command.name].execute(event.input);
		},
	},
});
