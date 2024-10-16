import {RSCClient} from "~/src/widgets/rsc-client";
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
	"rsc-client": () => <RSCClient />,
};

export type WidgetID = keyof typeof widgets;

export function Widget({id}: {id: WidgetID}) {
	const Component = widgets[id as WidgetID];
	if (!Component) {
		console.error(new Error(`Unknown widget: ${id}`));
		return <div>Unknown widget: {id}</div>;
	}

	return <Component />;
}
