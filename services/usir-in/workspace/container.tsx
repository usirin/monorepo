"use client";

import {Text} from "@radix-ui/themes";
import {execute} from "@usirin/spellbook/spellbook";
import {type Workspace, getActiveWorkspace} from "@usirin/studio";
import {useEffect} from "react";
import {Panel} from "~/studio/panel";
import {PanelGroup} from "~/studio/panel-group";
import {ResizeHandle} from "~/studio/resize-handle";
import {useRunekeeper} from "~/studio/runekeeper-manager";
import {newSpellbook, useStudioManager} from "~/studio/studio-manager";
import {PanelLayout} from "./panel-layout";
import {PanelStack} from "./stack-panel";

// we are going to allow this to be a custom component defined in the workspace store
// this will allow us to have a custom left panel for each workspace
function LeftPanel() {
	const workspace = useStudioManager((studio) => getActiveWorkspace(studio.state));

	return (
		<PanelLayout variant="surface" isSelected header={null}>
			<Text size="2">focused: {workspace.focused?.join(":")}</Text>
		</PanelLayout>
	);
}

function RightPanel() {
	return (
		<PanelLayout variant="surface" isSelected header={null}>
			{/*<WidgetDebugger id={focused?.key as WidgetID} /> */}
			<Text>Right Panel</Text>
		</PanelLayout>
	);
}

export function WorkspaceContainer({workspace}: {workspace: Workspace}) {
	const {runekeeper} = useRunekeeper();

	useEffect(() => {
		runekeeper.map("normal", "-", () => {
			execute(newSpellbook, "window:split-horizontal", undefined);
		});

		runekeeper.map("normal", "|", () => {
			execute(newSpellbook, "window:split-vertical", {});
		});

		runekeeper.map("normal", "<c-j>", () => {
			execute(newSpellbook, "window:focus-down", undefined);
		});

		runekeeper.map("normal", "<c-k>", () => {
			execute(newSpellbook, "window:focus-up", {});
		});

		runekeeper.map("normal", "<c-l>", () => {
			execute(newSpellbook, "window:focus-right", {});
		});

		runekeeper.map("normal", "<c-h>", () => {
			execute(newSpellbook, "window:focus-left", {});
		});

		return () => {
			runekeeper.unmap("normal", "-");
			runekeeper.unmap("normal", "|");
			runekeeper.unmap("normal", "q");
		};
	}, [runekeeper]);

	return (
		<PanelGroup autoSaveId={workspace.id} direction="horizontal">
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
