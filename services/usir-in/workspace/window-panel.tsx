import type {StackPath, Window} from "@usirin/layout-tree";
import {execute} from "@usirin/spellbook";
import {getActiveWorkspace} from "@usirin/studio";
import {MemoryRouter, Route, Routes} from "react-router";
import {newSpellbook, useStudioManager} from "~/studio/studio-manager";
import {type WidgetID, renderWidget} from "~/studio/widget";
import {PanelHeader, PanelLayout} from "./panel-layout";

// TODO: make this work with react-focus-rings
export function WindowPanel({window, path}: {window: Window; path: StackPath}) {
	const workspace = useStudioManager((studio) => getActiveWorkspace(studio.state));

	return (
		<PanelLayout
			onClick={() => execute(newSpellbook, "window:focus", {path})}
			isSelected={workspace.focused.join(":") === path.join(":")}
			header={<PanelHeader>widget://{window.key}</PanelHeader>}
		>
			<MemoryRouter>
				<Routes>
					<Route path="/" element={renderWidget({id: window.key as WidgetID})} />
				</Routes>
			</MemoryRouter>
		</PanelLayout>
	);
}
