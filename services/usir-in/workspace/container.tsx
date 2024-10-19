"use client";

import {Panel} from "~/studio/panel";
import {PanelGroup} from "~/studio/panel-group";
import {ResizeHandle} from "~/studio/resize-handle";
import {PanelStack} from "./stack-panel";
import {useWorkspaceStore} from "./workspace-manager";

export function WorkspaceContainer() {
	const {workspace} = useWorkspaceStore();

	return (
		<PanelGroup direction="horizontal">
			<Panel id="left-panel" order={1} defaultSize={15} maxSize={25}>
				Left Panel
			</Panel>
			<ResizeHandle id="left-panel" />
			<Panel id="workspace-widgets" order={2} defaultSize={70}>
				<PanelStack stack={workspace.layout.root} path={[]} />
			</Panel>
			<ResizeHandle id="right-panel" />
			<Panel id="right-panel" order={3} defaultSize={15} maxSize={25}>
				Right Panel
			</Panel>
		</PanelGroup>
	);
}
