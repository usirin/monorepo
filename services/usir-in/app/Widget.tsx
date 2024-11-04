import {Counter} from "../studio/widgets/Counter";
import {Generation} from "../studio/widgets/Generation";
import {Sandpack} from "../studio/widgets/Sandpack";
import {Scratch} from "../studio/widgets/Scratch";
import {ThemePanel as ThemeSettings} from "../studio/widgets/ThemeSettings";
import {Time} from "../studio/widgets/Time";
import {ChatWidget} from "../studio/widgets/ai/ChatWidget";

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
