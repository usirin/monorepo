import type {StackPath, Window} from "@umut/layout-tree";
import {getActiveWorkspace} from "@umut/studio";
import {MemoryRouter, Route, Routes} from "react-router";
import {spellbook, useStudioManager} from "~/studio/studio-manager";
import {type WidgetID, renderWidget} from "~/studio/widget";
import {PanelHeader, PanelLayout} from "./panel-layout";

export function WindowPanel({window, path}: {window: Window; path: StackPath}) {
	const workspace = useStudioManager((studio) => getActiveWorkspace(studio.state));

	return (
		<PanelLayout
			onClick={() => spellbook.execute("window:focus", {path})}
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
