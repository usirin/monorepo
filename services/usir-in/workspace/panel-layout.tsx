import {Box, Card, type CardProps, Flex, Inset, ScrollArea} from "@radix-ui/themes";
import React from "react";

function InsetAll({children}: {children: React.ReactNode}) {
	return <Inset side="all">{children}</Inset>;
}

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
	const InsetComponent = variant === "ghost" ? React.Fragment : InsetAll;

	return (
		<Card
			variant={variant}
			onClick={onClick}
			size="1"
			style={{height: "100%", opacity: isSelected ? 1 : 0.65}}
		>
			<InsetComponent>
				<Flex direction="column" width="100%" height="100%">
					{header}
					<ScrollArea type="hover">{children}</ScrollArea>
				</Flex>
			</InsetComponent>
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
