import {FlowManager, useStore as useFlowStore} from "~/flow/manager";
import {Counter, useStore as useCounterStore} from "./widgets/Counter";
import {Scratch, useStore as useScratchStore} from "./widgets/Scratch";
import {ThemePanel as ThemeSettings} from "./widgets/ThemeSettings";
import {Time, useStore as useTimeStore} from "./widgets/Time";
import {Chat} from "./widgets/VercelChat";

const widgets = {
	counter: {
		useStore: useCounterStore,
		Component: () => <Counter />,
	},
	scratch: {useStore: useScratchStore, Component: () => <Scratch />},
	"theme-settings": {useStore: useScratchStore, Component: () => <ThemeSettings />},
	time: {useStore: useTimeStore, Component: () => <Time />},
	flow: {useStore: useFlowStore, Component: () => <FlowManager />},
	chat: {useStore: useScratchStore, Component: () => <Chat />},
};

export type WidgetID = keyof typeof widgets;

export function useWidgetStore(id: WidgetID) {
	if (!widgets[id]?.useStore) {
		throw new Error(`Unknown widget: ${id}`);
	}

	return widgets[id].useStore;
}

export function renderWidget({id}: {id: WidgetID}) {
	const {Component} = widgets[id as WidgetID];
	if (!Component) {
		console.error(new Error(`Unknown widget: ${id}`));
		return <div>Unknown widget: {id}</div>;
	}

	return <Component />;
}
