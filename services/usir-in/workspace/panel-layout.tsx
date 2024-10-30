import {Box, Card, Flex, Inset, ScrollArea, Text} from "@radix-ui/themes";

export function PanelLayout({
	header,
	children,
	onClick,
	isSelected,
}: {
	header: React.ReactNode;
	isSelected: boolean;
	children: React.ReactNode;
	onClick?: () => void;
}) {
	return (
		<Card
			onClick={onClick}
			size="1"
			style={{height: "100%", opacity: isSelected ? 1 : 0.85, padding: 0}}
		>
			<Flex direction="column" width="100%" height="100%">
				{header}
				<ScrollArea type="hover">{children}</ScrollArea>
			</Flex>
		</Card>
	);
}

export function PanelHeader({
	children,
	// isSelected,
}: {isSelected?: boolean; children: React.ReactNode}) {
	return (
		<Box px="2" py="1" style={{backgroundColor: "var(--color-surface)"}}>
			<Text size="1" truncate>
				{children}
			</Text>
		</Box>
	);
}
