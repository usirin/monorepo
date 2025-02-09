"use client";

import {createRunekeeper} from "@usirin/runekeeper";
import {type PropsWithChildren, createContext, useContext, useEffect, useMemo} from "react";
import {useSyncExternalStore} from "react";
import {useModeState} from "./studio-state";

const MODE_KEYS = ["normal", "command"] as const;
type ModeKey = (typeof MODE_KEYS)[number];

type StudioRunekeeper = ReturnType<typeof createRunekeeper<ModeKey>>;
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
	const runekeeper = useMemo(() => createRunekeeper<ModeKey>([...MODE_KEYS]), []);
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

	return (
		<RunekeeperContext.Provider value={{runekeeper, state}}>{children}</RunekeeperContext.Provider>
	);
}

export function useKeymap(mode: ModeKey, sequence: string, command: () => void) {
	const {runekeeper} = useRunekeeper();

	useEffect(() => {
		runekeeper.map(mode, sequence, command);
		return () => runekeeper.unmap(mode, sequence);
	}, [runekeeper, mode, sequence, command]);
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
