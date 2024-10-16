import {Flex, Theme} from "@radix-ui/themes";
import {WorkspaceContainer} from "~/workspace/container";
import {KeystrokesManager} from "./keystrokes-manager";
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
			<KeystrokesManager>
				<Flex gap="1" p="1" direction="column" height="100%">
					<WorkspaceContainer />
					<Statusbar />
				</Flex>
			</KeystrokesManager>
		</Theme>
	);
}
