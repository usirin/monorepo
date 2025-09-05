"use client";

import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import {StudioCommandExecutor, StudioFileSystem} from "@usirin/platform-studio";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Stream from "effect/Stream";
import {useCallback, useEffect, useRef, useState} from "react";

// Create runtime for studio commands
const createStudioRuntime = () => {
	const allLayers = Layer.provide(StudioCommandExecutor.layer, StudioFileSystem.layer);
	return ManagedRuntime.make(allLayers);
};

interface CommandResult {
	stdout: string;
	stderr: string;
	exitCode: number;
	isRunning: boolean;
}

interface StreamingCommandResult {
	results: CommandResult[];
	isStreaming: boolean;
	error?: string;
}

export function useStudioCommands() {
	const runtime = useRef<ManagedRuntime.ManagedRuntime<any, never> | null>(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		runtime.current = createStudioRuntime();
		setIsReady(true);

		return () => {
			runtime.current?.dispose();
		};
	}, []);

	const parseCommand = useCallback((input: string): Command.Command => {
		// Simple command parsing for web app commands
		const parts = input.trim().split(/\s+/);
		const [command, ...args] = parts;

		return Command.make(command, ...args);
	}, []);

	const executeCommand = useCallback(
		async (input: string): Promise<CommandResult> => {
			if (!runtime.current || !isReady) {
				return {
					stdout: "",
					stderr: "Runtime not ready",
					exitCode: 1,
					isRunning: false,
				};
			}

			try {
				const command = parseCommand(input);

				const program = Effect.gen(function* () {
					const executor = yield* CommandExecutor.CommandExecutor;
					const process = yield* executor.start(command);

					// Collect stdout
					const stdoutChunks: Uint8Array[] = [];
					yield* Stream.runForEach(process.stdout, (chunk) =>
						Effect.sync(() => stdoutChunks.push(chunk)),
					);

					// Collect stderr
					const stderrChunks: Uint8Array[] = [];
					yield* Stream.runForEach(process.stderr, (chunk) =>
						Effect.sync(() => stderrChunks.push(chunk)),
					);

					// Wait for exit
					const exitCode = yield* process.exitCode;
					const isRunning = yield* process.isRunning;

					const stdoutData = new Uint8Array(
						stdoutChunks.reduce((acc, chunk) => acc + chunk.length, 0),
					);
					let stdoutOffset = 0;
					for (const chunk of stdoutChunks) {
						stdoutData.set(chunk, stdoutOffset);
						stdoutOffset += chunk.length;
					}

					const stderrData = new Uint8Array(
						stderrChunks.reduce((acc, chunk) => acc + chunk.length, 0),
					);
					let stderrOffset = 0;
					for (const chunk of stderrChunks) {
						stderrData.set(chunk, stderrOffset);
						stderrOffset += chunk.length;
					}

					return {
						stdout: new TextDecoder().decode(stdoutData),
						stderr: new TextDecoder().decode(stderrData),
						exitCode,
						isRunning,
					};
				});

				const result = await runtime.current.runPromise(program);
				return result;
			} catch (error) {
				return {
					stdout: "",
					stderr: error instanceof Error ? error.message : "Unknown error",
					exitCode: 1,
					isRunning: false,
				};
			}
		},
		[isReady, parseCommand],
	);

	const executeStreamingCommand = useCallback(
		async function* (input: string): AsyncGenerator<StreamingCommandResult> {
			if (!runtime.current || !isReady) {
				yield {
					results: [],
					isStreaming: false,
					error: "Runtime not ready",
				};
				return;
			}

			try {
				const command = parseCommand(input);

				const program = Effect.gen(function* () {
					const executor = yield* CommandExecutor.CommandExecutor;
					const process = yield* executor.start(command);

					// Stream stdout chunks as they arrive
					yield* Stream.runForEach(process.stdout, (chunk) =>
						Effect.sync(() => {
							const text = new TextDecoder().decode(chunk);
							// This would be sent to the generator
							console.log("Streaming chunk:", text);
						}),
					);

					return process;
				});

				// For now, just execute normally
				// TODO: Implement proper streaming
				const result = await executeCommand(input);

				yield {
					results: [result],
					isStreaming: false,
				};
			} catch (error) {
				yield {
					results: [],
					isStreaming: false,
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		},
		[isReady, parseCommand, executeCommand],
	);

	const getAvailableCommands = useCallback(() => {
		// Get commands from the registry with metadata
		try {
			// Use the exported function from StudioCommandExecutor
			return StudioCommandExecutor.getCommandMetadata();
		} catch (error) {
			// Fallback to static list if there's an issue
			return [
				{command: "help", description: "Show available commands", category: "system"},
				{command: "theme:toggle", description: "Toggle dark/light theme", category: "ui"},
				{command: "theme:set", description: "Set theme (light|dark)", category: "ui"},
				{command: "panel:toggle", description: "Toggle panel visibility", category: "ui"},
				{command: "panel:focus", description: "Focus on specific panel", category: "ui"},
				{command: "widget:create", description: "Create a new widget", category: "ui"},
				{command: "widget:remove", description: "Remove widget", category: "ui"},
				{command: "navigate:to", description: "Navigate to route", category: "navigation"},
				{command: "search:files", description: "Search through files", category: "search"},
				{command: "search:commands", description: "Search available commands", category: "search"},
				{command: "settings:open", description: "Open settings", category: "settings"},
				{command: "settings:reset", description: "Reset settings to default", category: "settings"},
				{command: "workspace:switch", description: "Switch workspace", category: "workspace"},
				{command: "workspace:create", description: "Create new workspace", category: "workspace"},
				{command: "layout:save", description: "Save current layout", category: "workspace"},
				{command: "layout:restore", description: "Restore saved layout", category: "workspace"},
				{command: "debug:toggle", description: "Toggle debug mode", category: "debug"},
				{command: "debug:clear", description: "Clear debug logs", category: "debug"},
				{command: "quit", description: "Close studio", category: "vim"},
				{command: "q", description: "Close studio (short)", category: "vim"},
				{command: "w", description: "Save workspace", category: "vim"},
				{command: "wq", description: "Save and close", category: "vim"},
				{command: "split", description: "Split panel horizontally", category: "vim"},
				{command: "vsplit", description: "Split panel vertically", category: "vim"},
				{command: "tabnew", description: "Create new tab", category: "vim"},
				{command: "tabclose", description: "Close current tab", category: "vim"},
			];
		}
	}, []);

	return {
		isReady,
		executeCommand,
		executeStreamingCommand,
		getAvailableCommands,
		parseCommand,
	};
}
