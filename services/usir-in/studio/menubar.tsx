import {PlusIcon} from "@radix-ui/react-icons";
import {Button, Card, Code, Flex, IconButton, Inset, Text, Tooltip} from "@radix-ui/themes";
import {spellbook, useStudioManager} from "./studio-manager";

export function Menubar() {
	// Use separate selectors for primitives to avoid object creation
	const studio = useStudioManager();

	return (
		<Card variant="surface" size="1" style={{flexShrink: 0, "--card-padding": "var(--space-1)"}}>
			<Flex gap="1" align="center" justify="end">
				{Object.values(studio.state.workspaces).map((workspace, index) => (
					<Tooltip
						key={workspace.id}
						content={
							<Text>
								click to focus
								<br /> middle click to remove
							</Text>
						}
					>
						<IconButton
							key={workspace.id}
							variant={workspace.id === studio.state.activeWorkspace ? "solid" : "soft"}
							onClick={() => spellbook.execute("workspace:set-active", {id: workspace.id})}
							onAuxClick={(e) => {
								if (e.button === 1) {
									e.preventDefault();
									spellbook.execute("workspace:remove", {id: workspace.id});
								}
							}}
							size="1"
							color="gray"
							style={{width: 20, height: 20}}
						>
							<Code variant="ghost" size="1" style={{fontSize: 10}}>
								{index}
							</Code>
						</IconButton>
					</Tooltip>
				))}
				<IconButton
					variant="surface"
					onClick={() => spellbook.execute("workspace:create")}
					style={{width: 20, height: 20}}
					size="1"
					color="gray"
				>
					<PlusIcon width={12} height={12} />
				</IconButton>
			</Flex>
		</Card>
	);
}
