import omit from "lodash.omit";
import {type WidgetID, useWidgetStore} from "~/studio/widget";

export function WidgetDebugger({id}: {id: WidgetID}) {
	const useStore = useWidgetStore(id);

	if (!useStore) {
		return <div>Widget not found</div>;
	}

	return (
		<pre>
			{JSON.stringify(omit(useStore() ?? {}, "actions"), null, 2)}
			{JSON.stringify(omit(useStore() ?? {}, "actions"), null, 2)}
		</pre>
	);
}
