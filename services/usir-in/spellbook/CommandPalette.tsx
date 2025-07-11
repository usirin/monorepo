"use client";

import {Code, Flex, Text} from "@radix-ui/themes";
import {execute, type Spellbook} from "@usirin/spellbook/spellbook";
import {isValidElement, type ReactNode, useCallback, useState} from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./Command";

function useNavigationApi() {
	const [stack, setStack] = useState<ReactNode[]>([]);

	const push = useCallback((node: ReactNode) => {
		setStack((stack) => [...stack, node]);
	}, []);

	const pop = useCallback(() => {
		setStack((paths) => paths.slice(0, -1));
	}, []);

	const peek = useCallback(() => {
		return stack[stack.length - 1];
	}, [stack]);

	return {paths: stack, push, pop, peek};
}

function RootCommand({
	onSelect,
	spellbook,
}: {
	onSelect: (key: string) => void;
	spellbook: Spellbook;
}) {
	type SpellType = (typeof spellbook.spells)[keyof typeof spellbook.spells];

	const groupedCommands = Object.entries(spellbook.spells).reduce<
		Record<string, Array<[string, SpellType]>>
	>((acc, [key, spell]) => {
		const group = key.split(":")[0];
		if (!acc[group]) {
			acc[group] = [];
		}
		acc[group].push([key, spell]);
		return acc;
	}, {});

	return (
		<>
			{Object.entries(groupedCommands).map(([group, commands]) => (
				<CommandGroup key={group} heading={group}>
					{commands.map(([key, spell]) => (
						<CommandItem key={key} value={key} onSelect={() => onSelect(key)}>
							<Flex align="center" gap="2">
								<Text size="1">{spell.description}</Text>
							</Flex>
							<Flex align="center" gap="2">
								<Code size="1" variant="soft" style={{opacity: 0.5}}>
									{key}
								</Code>
							</Flex>
						</CommandItem>
					))}
				</CommandGroup>
			))}
		</>
	);
}

export function CommandPalette({
	onSelect,
	spellbook,
}: {
	onSelect?: (key: string) => void;
	spellbook: Spellbook;
}) {
	const [value, setValue] = useState("");
	const [search, setSearch] = useState("");
	const navigation = useNavigationApi();

	// Function to handle spell selection for any spellbook
	const handleSpellSelection = useCallback(
		async (currentSpellbook: Spellbook, key: string) => {
			const spell = currentSpellbook.spells[key as keyof typeof currentSpellbook.spells];
			if (!spell) return;

			const result = await execute(
				currentSpellbook,
				key as keyof typeof currentSpellbook.spells,
				undefined,
			);

			// Check if the result is a spellbook and convert it to a component before pushing
			if (result && typeof result === "object" && "spells" in result) {
				// Create a component for the nested spellbook
				const nestedSpellbook = result;
				const nestedComponent = (
					<RootCommand
						onSelect={(nestedKey) => handleSpellSelection(nestedSpellbook, nestedKey)}
						spellbook={nestedSpellbook}
					/>
				);
				navigation.push(nestedComponent);
			} else if (isValidElement(result)) {
				navigation.push(result);
			} else {
				onSelect?.(key);
			}

			setValue("");
			setSearch("");
		},
		[navigation, onSelect],
	);

	// Main handler for the root spellbook
	const handleSelect = useCallback(
		(key: string) => {
			handleSpellSelection(spellbook, key);
		},
		[spellbook, handleSpellSelection],
	);

	const activeItem = navigation.peek();
	const onKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Backspace" && !search && !!activeItem) {
				e.preventDefault();
				navigation.pop();
			}
		},
		[activeItem, search, navigation.pop],
	);

	// Simplified renderContent function as it no longer needs to check for Spellbook type
	const renderContent = () => {
		if (!activeItem) {
			return <RootCommand onSelect={handleSelect} spellbook={spellbook} />;
		}

		return activeItem;
	};

	return (
		<Command value={value} onValueChange={setValue} onKeyDown={onKeyDown}>
			<CommandInput
				value={search}
				onValueChange={setSearch}
				placeholder={
					activeItem ? "Type to filter, ⌫ to go back..." : "Type a command or search... (⌘K)"
				}
			/>
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				{renderContent()}
			</CommandList>
		</Command>
	);
}
