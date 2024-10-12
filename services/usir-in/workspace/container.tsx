import {Box} from "@radix-ui/themes";
import {createStack, createTree, createWindow} from "@umut/layout-tree";
import {PanelStack} from "./stack-panel";

const tree = createTree(
	createStack("vertical", [
		createWindow("left-nav"),
		createWindow("theme-settings"),
		createWindow("scratch"),
		createStack("horizontal", [
			createWindow("chat"),
			createStack("vertical", [createWindow("scratch"), createWindow("chat")]),
			createWindow("chat"),
		]),
	]),
);

console.log(JSON.stringify(tree, null, 2));

async function fetchLayout() {
	return tree;
}

export async function WorkspaceContainer() {
	const layout = await fetchLayout();

	return (
		<Box style={{flex: 1}}>
			<PanelStack stack={layout.root} path={[]} />
		</Box>
	);
}
