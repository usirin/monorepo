import {create} from "zustand";
import {immer} from "zustand/middleware/immer";

interface LogMessage {
	level: "info" | "warn" | "error";
	message: string;
}

export interface Logger {
	tag: "logger";

	key: string;
	messages: LogMessage[];

	info: (...args: unknown[]) => void;
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
}

export function createLogger(key: string): Logger {
	const messages: LogMessage[] = [];

	return {
		tag: "logger",
		key,
		messages,
		info: (...args: unknown[]) => messages.push({level: "info", message: JSON.stringify(args)}),
		warn: (...args: unknown[]) => messages.push({level: "warn", message: JSON.stringify(args)}),
		error: (...args: unknown[]) => messages.push({level: "error", message: JSON.stringify(args)}),
	};
}
