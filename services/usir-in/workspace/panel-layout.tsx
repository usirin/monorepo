import {Box, Card, type CardProps, ScrollArea} from "@radix-ui/themes";

export function PanelLayout({
	header,
	children,
	onClick,
	isSelected,
	variant,
}: {
	header: React.ReactNode;
	isSelected: boolean;
	children: React.ReactNode;
	onClick?: () => void;
	variant?: CardProps["variant"];
}) {
	return (
		<Card
			variant={variant}
			onClick={onClick}
			size="1"
			style={{
				height: "100%",
				opacity: isSelected ? 1 : 0.65,
				paddingLeft: 0,
				paddingRight: 0,
				paddingTop: 0,
			}}
		>
			{header}
			<ScrollArea type="hover" asChild>
				<Box pl="2" pr="4" pt="1">
					{children}
				</Box>
			</ScrollArea>
		</Card>
	);
}

export function PanelHeader({
	children,
	// isSelected,
}: {isSelected?: boolean; children: React.ReactNode}) {
	return (
		<Box px="2" py="1" style={{backgroundColor: "var(--color-surface)"}}>
			{children}
		</Box>
	);
}
