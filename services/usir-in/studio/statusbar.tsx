"use client";

import {Card, Flex, Text, Theme} from "@radix-ui/themes";
import {useModeState} from "./studio-state";

export function Statusbar() {
	const {state} = useModeState();

	return (
		<Card size="1">
			<Flex align="center" justify="between" width="100%">
				{state && <Text size="1">Mode: {state.value}</Text>}
			</Flex>
		</Card>
	);
}
