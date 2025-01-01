"use client";
import {Card, Code, Flex, TextField} from "@radix-ui/themes";
import {Command} from "cmdk";
import {useState} from "react";
import type {z} from "zod";
import type {Command as CommandType} from "~/workspace/workspace-manager";
import {useModeState} from "./studio-state";

export function CommandPanel({
	commands,
	onSelect,
}: {
	commands: Record<string, CommandType<string, z.ZodType>>;
	onSelect?: (key: string) => void;
}) {
	const [value, setValue] = useState("");
	const [search, setSearch] = useState("");
	const {state, send} = useModeState();

	if (!state.matches("command")) {
		return null;
	}

	return (
		<Card size="1" style={{flexShrink: 0}}>
			<Command value={value} onValueChange={setValue}>
				<Command.List>
					{Object.values(commands).map((command) => (
						<Command.Item
							key={command.name}
							value={command.name}
							color="indigo"
							onSelect={() => {
								// TODO: Fix this by parsing the schema and providing the correct args
								// biome-ignore lint/suspicious/noExplicitAny: <explanation>
								command.execute({} as any);
								setValue("");
								setSearch("");
								send({type: "NORMAL"});
							}}
						>
							<Flex
								p="2"
								align="center"
								justify="between"
								width="100%"
								style={{
									backgroundColor: command.name === value ? "var(--gray-3)" : "transparent",
									borderRadius: "var(--radius-2)",
								}}
							>
								<Code size="1" variant="ghost">
									{command.description}
								</Code>
								<Code size="1" variant="soft">
									{command.name}
								</Code>
							</Flex>
						</Command.Item>
					))}
				</Command.List>
				<Command.Input value={search} onValueChange={setSearch} style={{display: "none"}} />

				<TextField.Root autoFocus value={search} onChange={(e) => setSearch(e.target.value)} />
			</Command>
		</Card>
	);
}
