import type {StackPath, Window} from "@umut/layout-tree";
import {type WidgetID, renderWidget} from "~/studio/widget";
import {PanelHeader, PanelLayout} from "./panel-layout";
import {commands, useWorkspaceStore} from "./workspace-manager";

export function WindowPanel({window, path}: {window: Window; path: StackPath}) {
	const {focused} = useWorkspaceStore((state) => state.workspace);

	return (
		<PanelLayout
			onClick={() => commands.focus.execute({path})}
			isSelected={focused.join(":") === path.join(":")}
			header={<PanelHeader>widget://{window.key}</PanelHeader>}
		>
			{renderWidget({id: window.key as WidgetID})}
		</PanelLayout>
	);
}
