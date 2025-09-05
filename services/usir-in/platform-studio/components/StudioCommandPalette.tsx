"use client";

import {Code, Flex, Text} from "@radix-ui/themes";
import {useCallback, useEffect, useRef, useState} from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../../spellbook/Command";
import {useStudioCommands} from "../hooks/useStudioCommands";

interface CommandHistoryItem {
	input: string;
	output: string;
	exitCode: number;
	timestamp: number;
}

interface StudioCommandPaletteProps {
	onClose?: () => void;
}

export function StudioCommandPalette({onClose}: StudioCommandPaletteProps) {
	const [input, setInput] = useState("");
	const [history, setHistory] = useState<CommandHistoryItem[]>([]);
	const [isExecuting, setIsExecuting] = useState(false);
	const [mode, setMode] = useState<"search" | "execute" | "history">("search");
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus input when component mounts
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, []);

	const {isReady, executeCommand, getAvailableCommands, parseCommand} = useStudioCommands();

	const availableCommands = getAvailableCommands();

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Vim-like command mode behavior
			if (e.key === "Enter" && input.trim()) {
				handleExecuteCommand(input.trim());
			} else if (e.key === "Escape") {
				if (mode === "execute" || mode === "history") {
					setMode("search");
					setInput("");
				} else {
					onClose?.();
				}
			} else if (e.key === ":" && mode === "search" && !input) {
				// Enter command mode like vim
				e.preventDefault();
				setMode("execute");
				setInput("");
			} else if (e.key === "/" && mode === "search" && !input) {
				// Enter search mode like vim
				e.preventDefault();
				setMode("search");
				setInput("");
			} else if (e.key === "Tab") {
				e.preventDefault();
				// Cycle through modes
				const modes = ["search", "execute", "history"] as const;
				const currentIndex = modes.indexOf(mode);
				const nextIndex = (currentIndex + 1) % modes.length;
				setMode(modes[nextIndex]);
			} else if (e.key === "ArrowUp" && mode === "history") {
				// Navigate history with arrow keys
				e.preventDefault();
				// TODO: Implement history navigation
			} else if (e.key === "ArrowDown" && mode === "history") {
				e.preventDefault();
				// TODO: Implement history navigation
			}
		},
		[input, mode, onClose],
	);

	const handleExecuteCommand = useCallback(
		async (commandInput: string) => {
			if (!isReady) return;

			setIsExecuting(true);
			setMode("execute");

			try {
				const result = await executeCommand(commandInput);

				const historyItem: CommandHistoryItem = {
					input: commandInput,
					output: result.stdout || result.stderr || "No output",
					exitCode: result.exitCode,
					timestamp: Date.now(),
				};

				setHistory((prev) => [historyItem, ...prev].slice(0, 100)); // Keep last 100 commands
				setInput("");

				// If command was successful and it's a UI command, maybe close the palette
				if (
					result.exitCode === 0 &&
					(commandInput.startsWith("theme:") ||
						commandInput.startsWith("navigate:") ||
						commandInput.startsWith("panel:"))
				) {
					setTimeout(() => onClose?.(), 500);
				}
			} catch (error) {
				console.error("Command execution error:", error);
			} finally {
				setIsExecuting(false);
			}
		},
		[isReady, executeCommand, onClose],
	);

	const handleCommandSelect = useCallback((command: string) => {
		setInput(command);
		setMode("execute");
		// Focus input for parameter entry
		setTimeout(() => inputRef.current?.focus(), 0);
	}, []);

	// Show all commands when input is empty, otherwise filter
	const filteredCommands =
		input.trim() === ""
			? availableCommands
			: availableCommands.filter(
					(cmd) =>
						cmd.command.toLowerCase().includes(input.toLowerCase()) ||
						cmd.description.toLowerCase().includes(input.toLowerCase()),
				);

	const filteredHistory = history.filter(
		(item) =>
			item.input.toLowerCase().includes(input.toLowerCase()) ||
			item.output.toLowerCase().includes(input.toLowerCase()),
	);

	const renderSearchMode = () => (
		<>
			<CommandGroup heading="Available Commands">
				{filteredCommands.map((cmd) => (
					<CommandItem
						key={cmd.command}
						value={cmd.command}
						onSelect={() => handleCommandSelect(cmd.command)}
					>
						<Flex align="center" gap="2" style={{flex: 1}}>
							<Code size="1" variant="soft">
								{cmd.command}
							</Code>
							<Text size="1" style={{opacity: 0.7}}>
								{cmd.description}
							</Text>
						</Flex>
					</CommandItem>
				))}
			</CommandGroup>

			{input.includes("|") && (
				<CommandGroup heading="Piped Command">
					<CommandItem value="pipe-preview" onSelect={() => handleExecuteCommand(input)}>
						<Flex align="center" gap="2">
							<Text size="1" style={{fontFamily: "monospace"}}>
								{input}
							</Text>
							<Text size="1" style={{opacity: 0.5}}>
								Press Enter to execute
							</Text>
						</Flex>
					</CommandItem>
				</CommandGroup>
			)}
		</>
	);

	const renderExecuteMode = () => (
		<CommandGroup heading="Execute Command">
			<CommandItem value="execute" onSelect={() => handleExecuteCommand(input)}>
				<Flex direction="column" gap="1" style={{width: "100%"}}>
					<Flex align="center" gap="2">
						<Text size="1" style={{fontFamily: "monospace", color: "var(--green-11)"}}>
							$
						</Text>
						<Text size="1" style={{fontFamily: "monospace"}}>
							{input || "Enter command..."}
						</Text>
					</Flex>
					<Text size="1" style={{opacity: 0.5}}>
						Press Enter to execute • ESC to cancel
					</Text>
				</Flex>
			</CommandItem>
		</CommandGroup>
	);

	const renderHistoryMode = () => (
		<CommandGroup heading="Command History">
			{filteredHistory.slice(0, 10).map((item, index) => (
				<CommandItem
					key={`${item.timestamp}-${index}`}
					value={item.input}
					onSelect={() => setInput(item.input)}
				>
					<Flex direction="column" gap="1" style={{width: "100%"}}>
						<Flex align="center" gap="2">
							<Text size="1" style={{fontFamily: "monospace"}}>
								{item.input}
							</Text>
							<Code
								size="1"
								variant={item.exitCode === 0 ? "soft" : "solid"}
								color={item.exitCode === 0 ? "green" : "red"}
							>
								{item.exitCode}
							</Code>
						</Flex>
						<Text size="1" style={{opacity: 0.7, fontFamily: "monospace"}}>
							{item.output.substring(0, 60)}
							{item.output.length > 60 ? "..." : ""}
						</Text>
					</Flex>
				</CommandItem>
			))}
		</CommandGroup>
	);

	const renderContent = () => {
		switch (mode) {
			case "execute":
				return renderExecuteMode();
			case "history":
				return renderHistoryMode();
			default:
				return renderSearchMode();
		}
	};

	const getPlaceholder = () => {
		switch (mode) {
			case "execute":
				return "Enter command to execute... (ESC to cancel)";
			case "history":
				return "Search command history... (Tab to switch modes)";
			default:
				return "Search commands... (: for command mode, / for search)";
		}
	};

	const getModeIndicator = () => {
		switch (mode) {
			case "execute":
				return "EXEC";
			case "history":
				return "HIST";
			default:
				return "SEARCH";
		}
	};

	return (
		<Command onKeyDown={handleKeyDown}>
			<Flex
				align="center"
				gap="2"
				style={{padding: "8px 12px", borderBottom: "1px solid var(--gray-6)"}}
			>
				<Code size="1" variant="soft" color={mode === "execute" ? "green" : "gray"}>
					{getModeIndicator()}
				</Code>
				<Text size="1" style={{opacity: 0.7}}>
					{isExecuting ? "Executing..." : `${filteredCommands.length} commands available`}
				</Text>
				{!isReady && (
					<Text size="1" style={{color: "var(--orange-11)"}}>
						Loading runtime...
					</Text>
				)}
			</Flex>

			<CommandInput
				ref={inputRef}
				value={input}
				onValueChange={setInput}
				placeholder={getPlaceholder()}
				style={{fontFamily: mode === "execute" ? "monospace" : "inherit"}}
			/>

			<CommandList>
				<CommandEmpty>
					{mode === "history" ? "No matching commands in history" : "No commands found"}
				</CommandEmpty>
				{renderContent()}
			</CommandList>
		</Command>
	);
}
