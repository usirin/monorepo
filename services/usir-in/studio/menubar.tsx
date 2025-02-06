import {Button, Card, Flex, Inset} from "@radix-ui/themes";
import {spellbook, useStudioManager} from "./studio-manager";

export function Menubar() {
	// Use separate selectors for primitives to avoid object creation
	const studio = useStudioManager();

	return (
		<Card size="1" style={{flexShrink: 0}}>
			<Flex align="center" gap="3">
				<Flex gap="1">
					{Object.values(studio.state.workspaces).map((workspace, index) => (
						<Button
							key={workspace.id}
							variant={workspace.id === studio.state.activeWorkspace ? "solid" : "outline"}
							onClick={() => spellbook.execute("workspace:set-active", {id: workspace.id})}
							size="1"
						>
							{index}
						</Button>
					))}
				</Flex>

				<Button variant="ghost" onClick={() => spellbook.execute("workspace:create")}>
					+
				</Button>
			</Flex>
		</Card>
	);
}
