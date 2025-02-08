"use client";

import {Dialog, Flex, IconButton, Theme, VisuallyHidden} from "@radix-ui/themes";
import {getActiveWorkspace} from "@umut/studio";
import {useEffect} from "react";
import {create} from "zustand";
import {CommandPalette} from "~/spellbook/CommandPalette";
import {WorkspaceContainer} from "~/workspace/container";
import {commands} from "~/workspace/workspace-manager";
import {CommandPanel} from "./command-panel";
import {KeystrokesManager} from "./keystrokes-manager";
import {Menubar} from "./menubar";
import {RunekeeperContextManager, useRunekeeper} from "./runekeeper-manager";
import {Statusbar} from "./statusbar";
import {spellbook, useStudioManager} from "./studio-manager";

const useSpellbookState = create<{open: boolean; setOpen: (open: boolean) => void}>()((set) => ({
	open: false,
	setOpen: (open) => set({open}),
}));

function Spellbook() {
	const {runekeeper} = useRunekeeper();
	const open = useSpellbookState((state) => state.open);
	const setOpen = useSpellbookState((state) => state.setOpen);

	useEffect(() => {
		runekeeper.map("normal", "<c-p>", () => {
			setOpen(true);
		});

		return () => {
			runekeeper.unmap("normal", "<c-p>");
		};
	}, [runekeeper, setOpen]);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<VisuallyHidden>
				<Dialog.Title>Command Palette</Dialog.Title>
			</VisuallyHidden>
			<Dialog.Content size="1" maxHeight="400px" aria-describedby={undefined}>
				<CommandPalette onSelect={() => setOpen(false)} />
			</Dialog.Content>
		</Dialog.Root>
	);
}

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
						<Spellbook />
						<Statusbar />
					</Flex>
				</KeystrokesManager>
			</RunekeeperContextManager>
		</Theme>
	);
}
