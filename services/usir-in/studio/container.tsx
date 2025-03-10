"use client";

import {Dialog, Flex, Theme, VisuallyHidden} from "@radix-ui/themes";
import {getActiveWorkspace} from "@usirin/studio";
import {useEffect} from "react";
import {create} from "zustand";
import {CommandPalette} from "~/spellbook/CommandPalette";
import {WorkspaceContainer} from "~/workspace/container";
import {Menubar} from "./menubar";
import {RunekeeperContextManager, useRunekeeper} from "./runekeeper-manager";
import {Statusbar} from "./statusbar";
import {newSpellbook, useStudioManager} from "./studio-manager";

// TODO: move this to studio-manager state
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
				<CommandPalette onSelect={() => setOpen(false)} spellbook={newSpellbook} />
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
				<Flex gap="1" p="1" direction="column" height="100%">
					<Menubar />
					{activeWorkspace && (
						<WorkspaceContainer key={activeWorkspace.id} workspace={activeWorkspace} />
					)}
					<Spellbook />
					<Statusbar />
				</Flex>
			</RunekeeperContextManager>
		</Theme>
	);
}
