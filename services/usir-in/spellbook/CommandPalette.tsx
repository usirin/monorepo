"use client";

import {Code, Flex, Text} from "@radix-ui/themes";
import type {Command as SpellbookCommand} from "@umut/spellbook";
import {isValidElement, useCallback, useState} from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "./Command";
import {useSpellbook} from "./SpellbookContext";

export function CommandPalette() {
	const {spellbook, navigation} = useSpellbook();
	const [value, setValue] = useState("");
	const [search, setSearch] = useState("");

	const handleSelect = async (key: string) => {
		const result = await spellbook.execute(key as keyof typeof spellbook.commands);
		if (isValidElement(result)) {
			navigation.push(result);
		}

		setValue("");
		setSearch("");
	};

	const activePage = navigation.peek();
	const onKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Backspace" && !search && !!activePage) {
				e.preventDefault();
				navigation.pop();
			}
		},
		[activePage, search, navigation.pop],
	);

	return (
		<Command value={value} onValueChange={setValue} onKeyDown={onKeyDown}>
			<CommandInput
				value={search}
				onValueChange={setSearch}
				placeholder={
					activePage ? "Type to filter, ⌫ to go back..." : "Type a command or search... (⌘K)"
				}
			/>
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				{activePage ?? <RootCommand onSelect={handleSelect} />}
			</CommandList>
		</Command>
	);
}

function RootCommand({onSelect}: {onSelect: (key: string) => void}) {
	const {spellbook} = useSpellbook();
	const groupedCommands = Object.entries(spellbook.commands).reduce<
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		Record<string, Array<[string, SpellbookCommand<any, any>]>>
	>((acc, [key, command]) => {
		const group = command.meta?.group ?? "Other";
		if (!acc[group]) {
			acc[group] = [];
		}
		acc[group].push([key, command]);
		return acc;
	}, {});

	return (
		<>
			{Object.entries(groupedCommands).map(([group, commands]) => (
				<CommandGroup key={group} heading={group}>
					{commands.map(([key, command]) => (
						<CommandItem key={key} value={key} onSelect={() => onSelect(key)}>
							<Flex align="center" gap="2">
								{command.meta?.icon && <Text size="2">{command.meta.icon}</Text>}
								<Text size="1">{command.description}</Text>
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
