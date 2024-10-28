"use client";

import {type Window, getAt} from "@umut/layout-tree";
import {Panel} from "~/studio/panel";
import {PanelGroup} from "~/studio/panel-group";
import {ResizeHandle} from "~/studio/resize-handle";
import type {WidgetID} from "~/studio/widget";
import {PanelHeader, PanelLayout} from "./panel-layout";
import {PanelStack} from "./stack-panel";
import {WidgetDebugger} from "./widget-debugger";
import {useWorkspaceStore} from "./workspace-manager";

export function WorkspaceContainer() {
	const {workspace} = useWorkspaceStore();
	const focused = getAt(workspace.layout.root, workspace.focused) as Window;

	return (
		<PanelGroup direction="horizontal">
			<Panel id="left-panel" order={1} collapsible={true} collapsedSize={0} minSize={10}>
				<PanelLayout isSelected header={<PanelHeader>Left Panel</PanelHeader>}>
					foo
				</PanelLayout>
			</Panel>
			<ResizeHandle id="left-panel" />
			<Panel id="workspace-widgets" order={2} defaultSize={70}>
				<PanelStack stack={workspace.layout.root} path={[]} />
			</Panel>
			<ResizeHandle id="right-panel" />
			<Panel id="right-panel" order={3} minSize={15} defaultSize={15} maxSize={25}>
				<PanelLayout isSelected header={<PanelHeader>Right Panel</PanelHeader>}>
					<WidgetDebugger id={focused.key as WidgetID} />
				</PanelLayout>
			</Panel>
		</PanelGroup>
	);
}
