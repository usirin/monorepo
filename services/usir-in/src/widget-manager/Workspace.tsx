"use client";

import {
	DndContext,
	DragOverlay,
	MouseSensor,
	closestCorners,
	useDndMonitor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	ClockIcon,
	Cross1Icon,
	ReloadIcon,
	ViewHorizontalIcon,
	ViewVerticalIcon,
} from "@radix-ui/react-icons";
import {Box, Card, Code, Flex, IconButton, Text, TextField, Theme, Tooltip} from "@radix-ui/themes";
import clsx from "clsx";
import {Command} from "cmdk";
import {Fragment, useState} from "react";
import {
	PanelResizeHandle,
	Panel as ResizablePanel,
	PanelGroup as ResizablePanelGroup,
	type PanelGroupProps as ResizablePanelGroupProps,
	type PanelProps as ResizablePanelProps,
} from "react-resizable-panels";
import {match} from "ts-pattern";

import {type Stack, type StackPath, type Window, getAt} from "@umut/layout-tree";

import {Slot} from "waku/client";
import {create} from "zustand";
import {widgetKeys} from "../widgets";
import styles from "./wm.module.css";
import {commands, useWorkspaceStore} from "./workspace-store";

function ResizeHandle({id}: {id: string; path: StackPath}) {
	const {activePath} = useWorkspaceDndStore();

	if (activePath) return null;

	return (
		<PanelResizeHandle id={id} className={styles.ResizeHandleOuter}>
			<Box className={styles.ResizeHandleInner} />
		</PanelResizeHandle>
	);
}

function DropHandle({id, path, after}: {id: string; path: StackPath; after?: true}) {
	const {isOver, setNodeRef, active} = useDroppable({id, data: {path, after}});

	if (!active) return null;
	if (active.data.current?.path.join(":") === path.join(":")) return null;

	return (
		<Box ref={setNodeRef} className={clsx(styles.DropHandleOuter, isOver && styles.IsOver)}>
			<Box className={styles.DropHandleInner} />
		</Box>
	);
}

function Panel({children, ...props}: Omit<ResizablePanelProps, "id"> & {id: string}) {
	return (
		<ResizablePanel {...props} className={clsx(styles.Panel, props.className)}>
			{children}
		</ResizablePanel>
	);
}

function PanelGroup(props: Omit<ResizablePanelGroupProps, "className">) {
	return <ResizablePanelGroup {...props} className={styles.PanelGroup} />;
}

function PanelToolbar() {
	const {workspace} = useWorkspaceStore();
	const {toggle, showCommands} = useStatusbarStore();
	return (
		<Flex align="center" justify="end" gap="2">
			<Tooltip content={showCommands ? "Hide commands" : "Show commands"}>
				<IconButton size="1" variant="ghost" onClick={() => toggle()}>
					{showCommands ? (
						<ChevronDownIcon style={{width: "12px", height: "12px"}} />
					) : (
						<ChevronRightIcon style={{width: "12px", height: "12px"}} />
					)}
				</IconButton>
			</Tooltip>
			<Tooltip content="Show time">
				<IconButton
					size="1"
					variant="ghost"
					onClick={() => commands.updateWindow.execute({path: workspace.focused, key: "time"})}
				>
					<ClockIcon style={{width: "12px", height: "12px"}} />
				</IconButton>
			</Tooltip>
			<Tooltip content="Split vertically">
				<IconButton
					size="1"
					variant="ghost"
					onClick={() => {
						console.log("vertical", workspace.focused);
						commands.split.execute({path: workspace.focused, orientation: "vertical"});
					}}
				>
					<ViewVerticalIcon style={{width: "12px", height: "12px"}} />
				</IconButton>
			</Tooltip>
			<Tooltip content="Split horizontally">
				<IconButton
					size="1"
					variant="ghost"
					onClick={() => {
						console.log("horizontal", workspace.focused);
						commands.split.execute({path: workspace.focused, orientation: "horizontal"});
					}}
				>
					<ViewHorizontalIcon style={{width: "12px", height: "12px"}} />
				</IconButton>
			</Tooltip>
			<Tooltip content="Remove">
				<IconButton
					size="1"
					variant="ghost"
					onClick={() => commands.remove.execute({path: workspace.focused})}
				>
					<Cross1Icon style={{width: "12px", height: "12px"}} />
				</IconButton>
			</Tooltip>
		</Flex>
	);
}

function PanelTitle({window, path}: {window: Window; path: StackPath}) {
	const {workspace} = useWorkspaceStore();
	return (
		<Flex align="center" width="100%">
			<Text size="1" truncate>
				{window.id} - {window.key} - {path.join(":")}
				{workspace.focused.join(":") === path.join(":") && "*"}
			</Text>
		</Flex>
	);
}

function WindowPanel({window, path}: {window: Window; path: StackPath}) {
	const {attributes, listeners, setNodeRef, transform} = useDraggable({
		id: path.join(":"),
		data: {
			path,
		},
	});
	const style = transform
		? {transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`}
		: undefined;
	return (
		<Panel
			id={path.join(":")}
			order={path[path.length - 1]}
			onClick={() => commands.focus.execute({path})}
		>
			<Flex
				direction="column"
				ref={setNodeRef}
				width="100%"
				height="100%"
				style={style}
				{...attributes}
				{...listeners}
			>
				<WindowContent window={window} path={path} />
			</Flex>
		</Panel>
	);
}

function Widgets({onSelect}: {onSelect: (key: string) => void}) {
	const [value, setValue] = useState("");
	const [search, setSearch] = useState("");
	return (
		<Command value={value} onValueChange={setValue}>
			<Command.List>
				<TextField.Root autoFocus value={search} onChange={(e) => setSearch(e.target.value)} />
				{widgetKeys.map((key) => (
					<Command.Item
						key={key}
						value={key}
						color="indigo"
						onSelect={() => {
							onSelect(key);
						}}
					>
						<Flex
							p="2"
							align="center"
							justify="between"
							width="100%"
							style={{
								backgroundColor: key === value ? "var(--gray-3)" : "transparent",
								borderRadius: "var(--radius-2)",
							}}
						>
							<Code size="1" variant="ghost">
								{key}
							</Code>
						</Flex>
					</Command.Item>
				))}
			</Command.List>
			<Command.Input value={search} onValueChange={setSearch} style={{display: "none"}} />
		</Command>
	);
}

function WindowContent({window, path}: {window: Window; path: StackPath}) {
	const [status, setStatus] = useState<"idle" | "changing">("idle");

	return (
		<Card size="1" style={{height: "100%"}}>
			<Flex gap="2" direction="column" width="100%" height="100%">
				<Box style={{flex: "1 1 100%"}}>
					{status === "changing" ? (
						<Widgets
							onSelect={(key) => {
								setStatus("idle");
								commands.updateWindow.execute({path, key});
							}}
						/>
					) : (
						<Slot id={window.key} />
					)}
				</Box>
				<Flex p="0" gap="1" align="center">
					<Tooltip content={status === "changing" ? "Cancel" : "Change widget"}>
						<IconButton
							size="1"
							variant="ghost"
							onClick={() => {
								if (status === "changing") {
									setStatus("idle");
								} else {
									setStatus("changing");
								}
							}}
						>
							{status === "changing" ? (
								<Cross1Icon style={{width: "12px", height: "12px"}} />
							) : (
								<ReloadIcon style={{width: "12px", height: "12px"}} />
							)}
						</IconButton>
					</Tooltip>
					<PanelTitle window={window} path={path} />
				</Flex>
			</Flex>
		</Card>
	);
}

function PanelStack({stack, path}: {stack: Stack; path: StackPath}) {
	return (
		<PanelGroup
			id={path.length === 0 ? "root" : path.join(":")}
			autoSaveId="panel-stack"
			direction={stack.orientation === "horizontal" ? "vertical" : "horizontal"}
			style={{position: "relative"}}
		>
			{stack.children.map((child, index) => (
				<Fragment key={path.concat(index).join(":")}>
					{index !== 0 && (
						<ResizeHandle id={path.concat(index).join(":")} path={path.concat(index)} />
					)}
					<DropHandle id={path.concat(index).join(":")} path={path.concat(index)} />
					{match(child)
						.with({tag: "window"}, (window) => (
							<WindowPanel window={window} path={path.concat(index)} />
						))
						.with({tag: "stack"}, (stack) => (
							<ResizablePanel id={path.concat(index).join(":")} order={index}>
								<PanelStack stack={stack} path={path.concat(index)} />
							</ResizablePanel>
						))
						.exhaustive()}
					{index === stack.children.length - 1 && (
						<DropHandle
							id={path.concat(index).join(":").concat(":after")}
							path={path.concat(index)}
							after
						/>
					)}
				</Fragment>
			))}
		</PanelGroup>
	);
}

function WorkspaceInfo() {
	const {workspace} = useWorkspaceStore();
	return (
		<Code size="1" variant="ghost">
			Focused: {workspace.focused.length > 0 ? workspace.focused.join(":") : "none"}
		</Code>
	);
}

function Commands({onSelect}: {onSelect: (key: string) => void}) {
	const [value, setValue] = useState("");
	const [search, setSearch] = useState("");
	return (
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
							onSelect(command.name);
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

			<TextField.Root value={search} onChange={(e) => setSearch(e.target.value)} />
		</Command>
	);
}

function CommandsPanel() {
	const {showCommands, setShowCommands} = useStatusbarStore();

	if (!showCommands) return null;

	return (
		<Card size="1">
			<Commands onSelect={() => setShowCommands(false)} />
		</Card>
	);
}

const useStatusbarStore = create<{
	showCommands: boolean;
	setShowCommands: (showCommands: boolean) => void;
	toggle: () => void;
}>((set) => ({
	showCommands: false,
	setShowCommands: (showCommands: boolean) => set({showCommands}),
	toggle: () => set((state) => ({showCommands: !state.showCommands})),
}));

function WorkspaceStatusbar() {
	return (
		<Card size="1">
			<Flex align="center" justify="between" width="100%">
				<Flex>
					<WorkspaceInfo />
				</Flex>
				<Flex>
					<PanelToolbar />
				</Flex>
			</Flex>
		</Card>
	);
}

const useWorkspaceDndStore = create<{
	activePath: StackPath | null;
	setActivePath: (activePath: StackPath | null) => void;
}>((set) => ({
	activePath: null,
	setActivePath: (activePath: StackPath | null) => set({activePath}),
}));

export function Workspace() {
	const {workspace} = useWorkspaceStore();
	const {activePath, setActivePath} = useWorkspaceDndStore();

	const mouseSensor = useSensor(MouseSensor, {
		activationConstraint: {
			distance: 16,
		},
	});

	const sensors = useSensors(mouseSensor);

	return (
		<>
			<DndContext
				sensors={sensors}
				onDragStart={({active}) => {
					setActivePath(active.data.current?.path);
				}}
				onDragEnd={({active, over}) => {
					console.log({active, over});
					setActivePath(null);

					if (!over) return;

					if (active.id === over.id) return;

					const activePath = active.data.current?.path;
					const overPath = over.data.current?.path;

					if (!activePath || !overPath) return;

					const after = !!over.data.current?.after;

					if (after) {
						commands.moveAfter.execute({path: activePath, after: overPath});
					} else {
						commands.moveBefore.execute({path: activePath, before: overPath});
					}
				}}
				collisionDetection={closestCorners}
			>
				<Theme
					appearance="dark"
					accentColor="tomato"
					radius="small"
					scaling="90%"
					style={{height: "100%"}}
				>
					<Flex
						gap="8px"
						p="8px"
						style={{height: "100%", display: "flex", flexDirection: "column"}}
					>
						<Box style={{flex: 1}}>
							<DropHandle id="root" path={[]} />
							<PanelStack stack={workspace.layout.root} path={[]} />
							<DropHandle id="root" path={[]} after />
						</Box>
						<CommandsPanel />
						<WorkspaceStatusbar />
					</Flex>
					<DragOverlay dropAnimation={null}>
						{activePath && (
							<WindowContent
								window={getAt(workspace.layout.root, activePath) as Window}
								path={activePath}
							/>
						)}
					</DragOverlay>
				</Theme>
			</DndContext>
		</>
	);
}
