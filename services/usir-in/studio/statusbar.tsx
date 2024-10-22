"use client";

import {Card, Flex, Text, Theme} from "@radix-ui/themes";
import {useRunekeeper} from "./runekeeper-manager";
import {useModeState} from "./studio-state";

export function Statusbar() {
	const {state} = useModeState();
	const {state: runekeeperState} = useRunekeeper();

	console.log({runekeeperState});

	return (
		<Card size="1">
			<Flex align="center" justify="between" width="100%">
				<Text size="1">Mode: {state.value}</Text>
				<Text size="1">Buffer: {runekeeperState?.context.buffer}</Text>
			</Flex>
		</Card>
	);
}
