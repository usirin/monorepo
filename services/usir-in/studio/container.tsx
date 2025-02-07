"use client";

import {Flex, Theme} from "@radix-ui/themes";
import {getActiveWorkspace} from "@umut/studio";
import {WorkspaceContainer} from "~/workspace/container";
import {commands} from "~/workspace/workspace-manager";
import {CommandPanel} from "./command-panel";
import {KeystrokesManager} from "./keystrokes-manager";
import {Menubar} from "./menubar";
import {RunekeeperContextManager} from "./runekeeper-manager";
import {Statusbar} from "./statusbar";
import {useStudioManager} from "./studio-manager";

export function StudioContainer() {
	const activeWorkspace = useStudioManager((studio) => getActiveWorkspace(studio.state));

	return (
		<Theme
			appearance="dark"
			accentColor="tomato"
			grayColor="slate"
			radius="small"
			style={{height: "100%"}}
		>
			<RunekeeperContextManager>
				<KeystrokesManager>
					<Flex gap="1" p="1" direction="column" height="100%">
						<Menubar />
						{activeWorkspace && (
							<WorkspaceContainer key={activeWorkspace.id} workspace={activeWorkspace} />
						)}
						<CommandPanel commands={commands} />
						<Statusbar />
					</Flex>
				</KeystrokesManager>
			</RunekeeperContextManager>
		</Theme>
	);
}
