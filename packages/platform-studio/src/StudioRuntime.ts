import * as Terminal from "@effect/platform/Terminal";
import * as Effect from "effect/Effect";
import {pipe} from "effect/Function";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as StudioFileSystem from "./StudioFileSystem";
import * as StudioPath from "./StudioPath";
import * as StudioTerminal from "./StudioTerminal";

const loggerLayer = Effect.gen(function* () {
	const terminal = yield* Terminal.Terminal;
	const logger = Logger.make(({logLevel, message}) =>
		Effect.runSync(terminal.display(`[${logLevel.label}] ${message}`)),
	);

	return Logger.defaultLogger.pipe(Logger.replace(logger));
});

export const createTerminalRuntime = () => {
	const allLayers = pipe(
		StudioFileSystem.layer,
		Layer.provideMerge(StudioPath.layer),
		Layer.provideMerge(Layer.unwrapEffect(loggerLayer)),
		Layer.provideMerge(StudioTerminal.layer),
	);

	return ManagedRuntime.make(allLayers);
};
