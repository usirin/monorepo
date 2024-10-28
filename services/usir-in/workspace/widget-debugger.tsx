import type {Window} from "@umut/layout-tree";
import omit from "lodash.omit";
import {type WidgetID, useWidgetStore} from "~/studio/widget";

export function WidgetDebugger({id}: {id: WidgetID}) {
	const useStore = useWidgetStore(id);
	return <pre>{JSON.stringify(omit(useStore(), "actions"), null, 2)}</pre>;
}
