import type * as CommandExecutor from "@effect/platform/CommandExecutor";
import type * as FileSystem from "@effect/platform/FileSystem";
import type * as Path from "@effect/platform/Path";
import type * as Terminal from "@effect/platform/Terminal";
import type * as Worker from "@effect/platform/Worker";
import * as BrowserWorker from "@effect/platform-browser/BrowserWorker";
import {pipe} from "effect/Function";
import * as Layer from "effect/Layer";
import * as StudioCommandExecutor from "./StudioCommandExecutor";
import * as StudioFileSystem from "./StudioFileSystem";
import * as StudioPath from "./StudioPath";
import * as StudioTerminal from "./StudioTerminal";
import * as StudioTerminalInput from "./StudioTerminalInput";
import * as StudioTerminalOutput from "./StudioTerminalOutput";
import * as StudioTerminalReadline from "./StudioTerminalReadline";

export type StudioContext =
	| FileSystem.FileSystem
	| Path.Path
	| Terminal.Terminal
	| CommandExecutor.CommandExecutor
	| Worker.WorkerManager
	| StudioTerminalReadline.StudioTerminalReadline
	| StudioTerminalOutput.StudioTerminalOutput
	| StudioTerminalInput.StudioTerminalInput;

export const layer: Layer.Layer<StudioContext> = pipe(
	Layer.mergeAll(
		StudioPath.layer,
		StudioCommandExecutor.layer,
		StudioTerminal.layer,
		BrowserWorker.layerManager,
		StudioTerminalOutput.StudioTerminalOutput.Default,
		StudioTerminalReadline.StudioTerminalReadline.Default,
		StudioTerminalInput.StudioTerminalInput.Default,
	),
	Layer.provideMerge(StudioFileSystem.layer),
);
