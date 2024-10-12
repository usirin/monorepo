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
	time: Time,
	"theme-settings": () => <ThemeSettings />,
	generation: () => <Generation />,
	chat: () => <ChatWidget />,
} as const;

export function Widget({name}: {name: keyof typeof widgets}) {
	const Component = widgets[name];
	return <Component />;
}
