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
		<Card onClick={onClick} size="1" style={{height: "100%", opacity: isSelected ? 1 : 0.85}}>
			<Flex gap="4" direction="column" width="100%" height="100%">
				{header}
				<ScrollArea type="hover" style={{flex: 1}}>
					{children}
				</ScrollArea>
			</Flex>
		</Card>
	);
}

export function PanelHeader({
	children,
	// isSelected,
}: {isSelected?: boolean; children: React.ReactNode}) {
	return (
		<Inset style={{backgroundColor: "var(--color-surface)"}}>
			<Box px="2" py="1">
				<Text size="1" truncate>
					{children}
				</Text>
			</Box>
		</Inset>
	);
}
