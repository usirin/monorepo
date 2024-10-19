import {Counter} from "../src/widgets/Counter";
import {Generation} from "../src/widgets/Generation";
import {Sandpack} from "../src/widgets/Sandpack";
import {Scratch} from "../src/widgets/Scratch";
import {ThemePanel as ThemeSettings} from "../src/widgets/ThemeSettings";
import {Time} from "../src/widgets/Time";

const widgets = {
	counter: () => <Counter />,
	sandpack: () => <Sandpack />,
	scratch: () => <Scratch />,
	time: () => <Time />,
	"theme-settings": () => <ThemeSettings />,
	generation: () => <Generation />,
};

export type WidgetID = keyof typeof widgets;

export function renderWidget({id}: {id: WidgetID}) {
	const Component = widgets[id as WidgetID];
	if (!Component) {
		console.error(new Error(`Unknown widget: ${id}`));
		return <div>Unknown widget: {id}</div>;
	}

	return <Component />;
}
