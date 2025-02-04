"use client";

import {Box, Dialog, Flex, Inset, Separator, Text} from "@radix-ui/themes";
import clsx from "clsx";
import {Command as CommandPrimitive} from "cmdk";
import * as React from "react";
import styles from "./Command.module.css";

const Command = React.forwardRef<
	React.ComponentRef<typeof CommandPrimitive>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({className, ...props}, ref) => (
	<Flex asChild direction="column" width="100%" height="100%">
		<CommandPrimitive ref={ref} className={clsx(styles.Command, className)} {...props} />
	</Flex>
));
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({children, ...props}: Dialog.RootProps) => {
	return (
		<Dialog.Root {...props}>
			<CommandContent>{children}</CommandContent>
		</Dialog.Root>
	);
};

const CommandContent = ({children, ...props}: Dialog.ContentProps) => {
	return (
		<Dialog.Content {...props}>
			<Command>{children}</Command>
		</Dialog.Content>
	);
};

const CommandInput = React.forwardRef<
	React.ComponentRef<typeof CommandPrimitive.Input>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({className, ...props}, ref) => (
	<Inset side="x">
		<Flex align="center" direction="column" gap="2" overflow="visible">
			<CommandPrimitive.Input
				ref={ref}
				className={clsx(styles.CommandInput, className)}
				{...props}
			/>
			<CommandSeparator style={{width: "100%"}} />
		</Flex>
	</Inset>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
	React.ComponentRef<typeof CommandPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({...props}, ref) => <CommandPrimitive.List ref={ref} {...props} />);

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
	React.ComponentRef<typeof CommandPrimitive.Empty>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
	<Box asChild py="6">
		<Text asChild as="div" align="center" size="1">
			<CommandPrimitive.Empty ref={ref} {...props} />
		</Text>
	</Box>
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
	React.ComponentRef<typeof CommandPrimitive.Group>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({className, ...props}, ref) => (
	<Inset side="x">
		<CommandPrimitive.Group ref={ref} className={clsx(styles.CommandGroup, className)} {...props} />
	</Inset>
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
	React.ComponentRef<typeof Separator>,
	React.ComponentPropsWithoutRef<typeof Separator>
>(({className, ...props}, ref) => <Separator ref={ref} className={clsx(className)} {...props} />);

CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
	React.ComponentRef<typeof CommandPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({className, ...props}, ref) => (
	<CommandPrimitive.Item ref={ref} className={clsx(styles.CommandItem, className)} {...props} />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({className, ...props}: React.HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={clsx("ml-auto text-xs tracking-widest text-muted-foreground", className)}
			{...props}
		/>
	);
};
CommandShortcut.displayName = "CommandShortcut";

export {
	Command,
	CommandContent,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
};
