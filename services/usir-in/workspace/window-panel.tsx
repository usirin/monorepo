import {Box, Card, Flex, Inset, ScrollArea, Text} from "@radix-ui/themes";
import type {StackPath, Window} from "@umut/layout-tree";
import {type WidgetID, renderWidget} from "~/studio/widget";

export function WindowPanel({window, path}: {window: Window; path: StackPath}) {
	return (
		<Card size="1" style={{height: "100%"}}>
			<Flex gap="4" direction="column" width="100%" height="100%">
				<Inset style={{backgroundColor: "var(--color-surface)"}}>
					<PanelTitle window={window} path={path} />
				</Inset>
				<ScrollArea type="hover" style={{flex: 1}}>
					{renderWidget({id: window.key as WidgetID})}
				</ScrollArea>
			</Flex>
		</Card>
	);
}

function PanelTitle({window, path}: {window: Window; path: StackPath}) {
	return (
		<Box px="2" py="1">
			<Text size="1" truncate>
				widget://{window.key}
			</Text>
		</Box>
	);
}
