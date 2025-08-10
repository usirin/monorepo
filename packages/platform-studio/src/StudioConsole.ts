import * as Terminal from "@effect/platform/Terminal";
import {Layer} from "effect";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

export const TypeId: Console.TypeId = Symbol.for(
	"@usirin/platform-studio/StudioConsole",
) as Console.TypeId;

export const make = Effect.gen(function* () {
	const terminal = yield* Terminal.Terminal;

	const safeDisplay = (message: string) => {
		return terminal.display(message).pipe(Effect.catchAll(() => Effect.void));
	};

	return Console.Console.of({
		[TypeId]: TypeId,
		assert(condition, ...args) {
			return Effect.if(condition, {
				onTrue: () => safeDisplay(`[assert] ${args.join(" ")}`),
				onFalse: () => safeDisplay(`[assertion failed] ${args.join(" ")}`),
			});
		},
		clear: safeDisplay(`[clear]`),
		count(label) {
			return safeDisplay(`[count] ${label}`);
		},
		countReset(label) {
			return safeDisplay(`[count reset] ${label}`);
		},
		debug(...args) {
			return safeDisplay(`[debug] ${args.join(" ")}`);
		},
		dir(item, options) {
			return safeDisplay(`[dir] ${item} ${options}`);
		},
		dirxml(...args) {
			return safeDisplay(`[dirxml] ${args.join(" ")}`);
		},
		error(...args) {
			return safeDisplay(`[error] ${args.join(" ")}`);
		},
		group(options) {
			return safeDisplay(`[group] ${options}`);
		},
		groupEnd: safeDisplay(`[group end]`),
		info(...args) {
			return safeDisplay(`[info] ${args.join(" ")}`);
		},
		log(...args) {
			return safeDisplay(`[log] ${args.join(" ")}`);
		},
		table(tabularData, properties) {
			return safeDisplay(`[table] ${tabularData} ${properties}`);
		},
		time(label) {
			return safeDisplay(`[time] ${label}`);
		},
		timeEnd(label) {
			return safeDisplay(`[time end] ${label}`);
		},
		timeLog(label, ...args) {
			return safeDisplay(`[time log] ${label} ${args.join(" ")}`);
		},
		trace(...args) {
			return safeDisplay(`[trace] ${args.join(" ")}`);
		},
		warn(...args) {
			return safeDisplay(`[warn] ${args.join(" ")}`);
		},
		unsafe: console,
	});
});

export const layer = Layer.effect(Console.Console, make);
