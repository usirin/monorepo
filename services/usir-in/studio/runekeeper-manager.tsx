"use client";

import {createRunekeeper} from "@umut/runekeeper";
import {type PropsWithChildren, createContext, useContext, useEffect, useMemo} from "react";
import {useSyncExternalStore} from "react";
import {commands} from "~/workspace/workspace-manager";
import {useModeState} from "./studio-state";

type StudioRunekeeper = ReturnType<typeof createRunekeeper<"normal" | "command">>;
type StudioRunekeeperState = ReturnType<StudioRunekeeper["getSnapshot"]>;

type RunekeeperContextValue = {
	runekeeper: StudioRunekeeper;
	state: StudioRunekeeperState;
};

const RunekeeperContext = createContext<RunekeeperContextValue | null>(null);

/**
 * Provider component for Runekeeper instance
 * Manages a single instance of Runekeeper and provides it through context
 * Also handles global keyboard event listeners and mode integration
 */
export function RunekeeperContextManager({children}: PropsWithChildren) {
	const runekeeper = useMemo(() => createRunekeeper(["normal", "command"]), []);
	const modeStore = useModeState();

	// Track Runekeeper state changes
	const state = useSyncExternalStore((callback) => {
		const subscription = runekeeper.actor.subscribe(callback);
		return () => subscription.unsubscribe();
	}, runekeeper.getSnapshot);

	// Setup global keyboard event listener
	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			runekeeper.handleKeyPress(event, modeStore.state.value);
		};

		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [runekeeper, modeStore.state.value]);

	// Setup default key mappings
	useEffect(() => {
		const {map} = runekeeper;

		map("normal", "<c-p>", () => {
			modeStore.send({type: "COMMAND"});
		});

		map("command", "<c-p>", () => {
			console.log("Exiting command mode");
			modeStore.send({type: "ESC"});
		});

		map("normal", "-", () => {
			console.log("Splitting horizontally");
			commands.split.execute({orientation: "horizontal"});
		});

		map("normal", "|", () => {
			commands.split.execute({orientation: "vertical"});
		});

		map("normal", "ZZ", () => {
			commands.remove.execute({});
		});
	}, [modeStore.send, runekeeper]);

	return (
		<RunekeeperContext.Provider value={{runekeeper, state}}>{children}</RunekeeperContext.Provider>
	);
}

/**
 * Hook to access Runekeeper instance and state
 * Must be used within a RunekeeperContextManager
 */
export function useRunekeeper() {
	const context = useContext(RunekeeperContext);
	if (!context) {
		throw new Error("useRunekeeper must be used within a RunekeeperContextManager");
	}
	return context;
}
