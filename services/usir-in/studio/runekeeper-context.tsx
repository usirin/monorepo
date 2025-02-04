"use client";

import {createRunekeeper} from "@umut/runekeeper";
import {type PropsWithChildren, createContext, useContext, useEffect} from "react";
import {useSyncExternalStore} from "react";
import {commands} from "~/workspace/workspace-manager";
import {useModeState} from "./studio-state";

type RunekeeperContextValue = ReturnType<typeof createRunekeeper<"normal" | "command">>;

const RunekeeperContext = createContext<RunekeeperContextValue | null>(null);

/**
 * Provider component for Runekeeper instance
 * Manages a single instance of Runekeeper and provides it through context
 * Also handles global keyboard event listeners and mode integration
 */
export function RunekeeperProvider({children}: PropsWithChildren) {
	const modeStore = useModeState();
	const runekeeper = useSyncExternalStore(
		(callback) => {
			// Create a single instance of Runekeeper
			const instance = createRunekeeper(["normal", "command"]);
			const subscription = instance.actor.subscribe(callback);

			// Setup global keyboard event listener
			const handler = (event: KeyboardEvent) => {
				instance.handleKeyPress(event, modeStore.state.value);
			};
			document.addEventListener("keydown", handler);

			// Cleanup function
			return () => {
				subscription.unsubscribe();
				document.removeEventListener("keydown", handler);
			};
		},
		// Get snapshot function
		() => createRunekeeper(["normal", "command"]),
	);

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

	return <RunekeeperContext.Provider value={runekeeper}>{children}</RunekeeperContext.Provider>;
}

/**
 * Hook to access Runekeeper instance and state
 * Must be used within a RunekeeperProvider
 */
export function useRunekeeper() {
	const context = useContext(RunekeeperContext);
	if (!context) {
		throw new Error("useRunekeeper must be used within a RunekeeperProvider");
	}
	return context;
}
