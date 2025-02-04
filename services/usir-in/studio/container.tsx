"use client";

import {Flex, Theme} from "@radix-ui/themes";
import {WorkspaceContainer} from "~/workspace/container";
import {commands} from "~/workspace/workspace-manager";
import {CommandPanel} from "./command-panel";
import {KeystrokesManager} from "./keystrokes-manager";
import {RunekeeperContextManager} from "./runekeeper-manager";
import {Statusbar} from "./statusbar";

export function StudioContainer() {
	return (
		<Theme
			appearance="dark"
			accentColor="tomato"
			radius="small"
			scaling="90%"
			style={{height: "100%"}}
		>
			<RunekeeperContextManager>
				<KeystrokesManager>
					<Flex gap="1" p="1" direction="column" height="100%">
						<Statusbar />
						<WorkspaceContainer />
						<CommandPanel commands={commands} />
						<Statusbar />
					</Flex>
				</KeystrokesManager>
			</RunekeeperContextManager>
		</Theme>
	);
}
