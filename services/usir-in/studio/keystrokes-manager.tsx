"use client";

import {Keystrokes, KeystrokesProvider} from "@rwh/react-keystrokes";
import {type PropsWithChildren, useEffect} from "react";
import {useModeState} from "./studio-state";

const keystrokes = new Keystrokes();
export const KeystrokesManager = (props: PropsWithChildren) => {
	const {send} = useModeState();

	useEffect(() => {
		keystrokes.bindKey(":", () => {
			send({type: "COMMAND"});
		});

		keystrokes.bindKey("Escape", () => {
			send({type: "ESC"});
		});
	}, [send]);

	return <KeystrokesProvider keystrokes={keystrokes}>{props.children}</KeystrokesProvider>;
};
