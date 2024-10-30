"use client";

import {createRunekeeperMachine} from "@umut/runekeeper";
import {normalize, stringify} from "@umut/runekeeper/syntax-vim";
import {useEffect} from "react";
import {create} from "zustand";
import xstate from "zustand-middleware-xstate";
import {commands} from "~/workspace/workspace-manager";
import {useModeState} from "./studio-state";

const useRunekeeperStore = create(xstate(createRunekeeperMachine(["normal", "command"])));

const send = useRunekeeperStore.getState().send;

if (send) {
	send({
		type: "MAP",
		mode: "normal",
		sequence: "-",
		command: () => {
			commands.split.execute({orientation: "horizontal"});
		},
	});

	send({
		type: "MAP",
		mode: "normal",
		sequence: "|",
		command: () => {
			commands.split.execute({orientation: "vertical"});
		},
	});

	send({
		type: "MAP",
		mode: "normal",
		sequence: "ZZ",
		command: () => {
			return commands.remove.execute({});
		},
	});
}

export const useRunekeeper = () => {
	const store = useRunekeeperStore();
	const modeStore = useModeState();

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			if (store.send && modeStore.state.value) {
				store.send({type: "KEY_PRESS", key: stringify(event), mode: modeStore.state.value});
			}
		};

		document.addEventListener("keypress", handler);

		return () => {
			document.removeEventListener("keypress", handler);
		};
	}, [modeStore.state.value, store.send]);

	return store;
};
