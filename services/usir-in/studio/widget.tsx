import {FlowManager, useStore as useFlowStore} from "~/flow/manager";
import {Counter, useStore as useCounterStore} from "../src/widgets/Counter";
import {Scratch, useStore as useScratchStore} from "../src/widgets/Scratch";
import {Time, useStore as useTimeStore} from "../src/widgets/Time";

const widgets = {
	counter: {
		useStore: useCounterStore,
		Component: () => <Counter />,
	},
	scratch: {useStore: useScratchStore, Component: () => <Scratch />},
	time: {useStore: useTimeStore, Component: () => <Time />},
	flow: {useStore: useFlowStore, Component: () => <FlowManager />},
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
