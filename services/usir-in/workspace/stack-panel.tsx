import type {Stack, StackPath} from "@umut/layout-tree";
import {Fragment} from "react";
import {match} from "ts-pattern";
import {Panel} from "~/studio/panel";
import {PanelGroup} from "~/studio/panel-group";
import {ResizeHandle} from "~/studio/resize-handle";
import {WindowPanel} from "./window-panel";

export function PanelStack({stack, path}: {stack: Stack; path: StackPath}) {
	return (
		<PanelGroup
			id={path.length === 0 ? "root" : path.join(":")}
			direction={stack.orientation === "horizontal" ? "vertical" : "horizontal"}
			style={{position: "relative"}}
		>
			{stack.children.map((child, index) => (
				<Fragment key={path.concat(index).join(":")}>
					{index !== 0 && <ResizeHandle id={path.concat(index).join(":")} />}
					<Panel
						id={path.concat(index).join(":")}
						order={index}
						defaultSize={100 / stack.children.length}
					>
						{match(child)
							.with({tag: "window"}, (window) => (
								<WindowPanel window={window} path={path.concat(index)} />
							))
							.with({tag: "stack"}, (stack) => (
								<PanelStack stack={stack} path={path.concat(index)} />
							))
							.exhaustive()}
					</Panel>
				</Fragment>
			))}
		</PanelGroup>
	);
}
