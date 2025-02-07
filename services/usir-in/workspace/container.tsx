"use client";

import {Text} from "@radix-ui/themes";
import {type Window, getAt} from "@umut/layout-tree";
import {type Workspace, getActiveWorkspace} from "@umut/studio";
import {useEffect} from "react";
import {Panel} from "~/studio/panel";
import {PanelGroup} from "~/studio/panel-group";
import {ResizeHandle} from "~/studio/resize-handle";
import {useKeymap, useRunekeeper} from "~/studio/runekeeper-manager";
import {spellbook, useStudioManager} from "~/studio/studio-manager";
// import type {WidgetID} from "~/studio/widget";
import {PanelHeader, PanelLayout} from "./panel-layout";
import {PanelStack} from "./stack-panel";
// import {WidgetDebugger} from "./widget-debugger";
import {useActiveWorkspace, useRegistry} from "./workspace-registry";

// we are going to allow this to be a custom component defined in the workspace store
// this will allow us to have a custom left panel for each workspace
function LeftPanel() {
	const workspace = useStudioManager((studio) => getActiveWorkspace(studio.state));

	return (
		<PanelLayout isSelected header={<PanelHeader>Left Panel</PanelHeader>}>
			<Text size="2">focused: {workspace.focused?.join(":")}</Text>
		</PanelLayout>
	);
}

function RightPanel() {
	return (
		<PanelLayout isSelected header={<PanelHeader>Right Panel</PanelHeader>}>
			{/*<WidgetDebugger id={focused?.key as WidgetID} /> */}
			<Text>Right Panel</Text>
		</PanelLayout>
	);
}

export function WorkspaceContainer({workspace}: {workspace: Workspace}) {
	const {runekeeper} = useRunekeeper();

	useEffect(() => {
		runekeeper.map("normal", "-", () => {
			spellbook.execute("workspace:split-horizontal");
		});

		runekeeper.map("normal", "|", () => {
			spellbook.execute("workspace:split-vertical");
		});

		return () => {
			runekeeper.unmap("normal", "-");
			runekeeper.unmap("normal", "|");
		};
	}, [runekeeper]);

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
				<LeftPanel />
			</Panel>
			<ResizeHandle id="left-panel" />
			<Panel id="workspace-widgets" order={2} defaultSize={70}>
				<PanelStack stack={workspace.layout.root} path={[]} />
			</Panel>
			<ResizeHandle id="right-panel" />
			<Panel id="right-panel" order={3} collapsible minSize={15} defaultSize={15}>
				<RightPanel />
			</Panel>
		</PanelGroup>
	);
}
