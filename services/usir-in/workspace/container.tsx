"use client";

import {Text} from "@radix-ui/themes";
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
		<PanelGroup autoSaveId="panel-group" direction="horizontal">
			<Panel
				id="left-panel"
				order={1}
				collapsible={true}
				collapsedSize={0}
				minSize={10}
				maxSize={25}
			>
				<PanelLayout isSelected header={<PanelHeader>Left Panel</PanelHeader>}>
					<Text size="2">
						focused: {workspace.focused?.join(":")} - {focused?.key}
					</Text>
				</PanelLayout>
			</Panel>
			<ResizeHandle id="left-panel" />
			<Panel id="workspace-widgets" order={2} defaultSize={70}>
				<PanelStack stack={workspace.layout.root} path={[]} />
			</Panel>
			<ResizeHandle id="right-panel" />
			<Panel id="right-panel" order={3} collapsible minSize={15} defaultSize={15} maxSize={25}>
				<PanelLayout isSelected header={<PanelHeader>Right Panel</PanelHeader>}>
					{/*<WidgetDebugger id={focused?.key as WidgetID} /> */}
					<Text>Right Panel</Text>
				</PanelLayout>
			</Panel>
		</PanelGroup>
	);
}
