"use client";

import {Code, Flex, ScrollArea, Text} from "@radix-ui/themes";
import type {Command as SpellbookCommand} from "@usirin/spellbook";
import {type ReactNode, isValidElement, useCallback, useState} from "react";
import {spellbook} from "~/studio/studio-manager";
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

export function CommandPalette({onSelect}: {onSelect?: (key: string) => void}) {
	const [value, setValue] = useState("");
	const [search, setSearch] = useState("");
	const navigation = useNavigationApi();

	const handleSelect = async (key: string) => {
		const result = await spellbook.execute(key as keyof typeof spellbook.commands);
		if (isValidElement(result)) {
			navigation.push(result);
		}

		onSelect?.(key);

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
	const groupedCommands = Object.entries(spellbook.commands).reduce<
		Record<string, Array<[string, SpellbookCommand<any, any>]>>
	>((acc, [key, command]) => {
		const group = key.split(":")[0];
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
					{commands.map(
						([key, command]) =>
							!command.meta?.hidden && (
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
							),
					)}
				</CommandGroup>
			))}
		</>
	);
}
