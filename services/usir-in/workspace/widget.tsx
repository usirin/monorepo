import type {ComponentType} from "react";
import {Counter} from "../src/widgets/Counter";
import {Generation} from "../src/widgets/Generation";
import {Sandpack} from "../src/widgets/Sandpack";
import {Scratch} from "../src/widgets/Scratch";
import {ThemePanel as ThemeSettings} from "../src/widgets/ThemeSettings";
import {Time} from "../src/widgets/Time";
import {ChatWidget} from "../src/widgets/ai/ChatWidget";

export const widgets = {
	counter: () => <Counter />,
	sandpack: () => <Sandpack />,
	scratch: () => <Scratch />,
	time: () => <Time />,
	"theme-settings": () => <ThemeSettings />,
	generation: () => <Generation />,
	chat: () => <ChatWidget />,
};

export type WidgetID = keyof typeof widgets;

export function Widget({id: name}: {id: WidgetID}) {
	const Component = widgets[name as WidgetID];
	if (!Component) {
		throw new Error(`Unknown widget: ${name}`);
	}

	return <Component />;
}
