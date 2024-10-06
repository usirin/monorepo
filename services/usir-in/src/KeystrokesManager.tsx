"use client";

import {Keystrokes, KeystrokesProvider} from "@rwh/react-keystrokes";
import type {PropsWithChildren} from "react";

export const KeystrokesManager = (props: PropsWithChildren) => {
	const keystrokes = new Keystrokes();

	return <KeystrokesProvider keystrokes={keystrokes}>{props.children}</KeystrokesProvider>;
};
