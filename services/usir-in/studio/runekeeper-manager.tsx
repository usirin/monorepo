"use client";

import {createRunekeeper} from "@umut/runekeeper";
import {useEffect, useMemo, useState} from "react";
import {commands} from "~/workspace/workspace-manager";
import {useModeState} from "./studio-state";

export const useRunekeeper = () => {
	const runekeeper = useMemo(() => createRunekeeper(["normal", "command"]), []);
	const modeStore = useModeState();

	const [snapshot, setSnapshot] = useState(runekeeper.getSnapshot());

	useEffect(() => {
		const subscription = runekeeper.actor.subscribe(setSnapshot);
		return () => {
			subscription.unsubscribe();
		};
	}, [runekeeper.actor]);

	useEffect(() => {
		const handler = (event: KeyboardEvent) => {
			runekeeper.handleKeyPress(event, modeStore.state.value);
		};

		document.addEventListener("keydown", handler);

		return () => {
			document.removeEventListener("keydown", handler);
		};
	}, [modeStore.state.value, runekeeper]);

	useEffect(() => {
		runekeeper.map("normal", "<c-p>", () => {
			modeStore.send({type: "COMMAND"});
		});
		runekeeper.map("command", "<c-p>", () => {
			console.log("Exiting command mode");
			modeStore.send({type: "ESC"});
		});

		runekeeper.map("normal", "-", () => {
			console.log("Splitting horizontally");
			commands.split.execute({orientation: "horizontal"});
		});

		runekeeper.map("normal", "|", () => {
			commands.split.execute({orientation: "vertical"});
		});

		runekeeper.map("normal", "ZZ", () => {
			commands.remove.execute({});
		});
	}, [runekeeper.map, modeStore.send]);

	return {state: snapshot, runekeeper};
};
