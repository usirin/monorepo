"use client";

import {Card, Flex, Text} from "@radix-ui/themes";
import {useRunekeeper} from "./runekeeper-manager";
import {useModeState} from "./studio-state";

export function Statusbar() {
	const {state} = useModeState();
	const {state: runekeeperState} = useRunekeeper();

	return (
		<Card size="1" style={{flexShrink: 0}}>
			<Flex align="center" justify="between" width="100%">
				<Text size="1">Mode: {state.value}</Text>
				<Text size="1">Buffer: {runekeeperState.context.buffer}</Text>
			</Flex>
		</Card>
	);
}
