import {Box} from "@radix-ui/themes";
import {createStack, createTree, createWindow} from "@umut/layout-tree";
import {Panel} from "~/studio/panel";
import {PanelGroup} from "~/studio/panel-group";
import {ResizeHandle} from "~/studio/resize-handle";
import {PanelStack} from "./stack-panel";

const tree = createTree(
	createStack("horizontal", [
		createWindow("rsc-client"),
		createStack("vertical", [createWindow("scratch"), createWindow("chat")]),
		createWindow("scratch"),
	]),
);

console.log(JSON.stringify(tree, null, 2));

async function fetchLayout() {
	return tree;
}

export async function WorkspaceContainer() {
	const layout = await fetchLayout();

	return (
		<PanelGroup direction="horizontal">
			<Panel id="left-panel" order={1} defaultSize={15} maxSize={25}>
				Left Panel
			</Panel>
			<ResizeHandle id="left-panel" />
			<Panel id="workspace-widgets" order={2} defaultSize={70}>
				<PanelStack stack={layout.root} path={[]} />
			</Panel>
			<ResizeHandle id="right-panel" />
			<Panel id="right-panel" order={3} defaultSize={15} maxSize={25}>
				Right Panel
			</Panel>
		</PanelGroup>
	);
}
