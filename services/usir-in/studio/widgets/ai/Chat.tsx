"use client";

import {Box, Button, Flex, TextField} from "@radix-ui/themes";
import {useActions, useUIState} from "ai/rsc";
import type {ClientMessage, sendMessage as sendMessageAction} from "./actions";
import type {AI} from "./context";

export function Chat() {
	const {sendMessage} = useActions() as {sendMessage: typeof sendMessageAction};
	const [messages, setMessages] = useUIState<typeof AI>();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		console.log({e});
		e.preventDefault();
		const message = (e.target as HTMLFormElement).message.value;

		setMessages((messages) => [
			...messages,
			{
				id: Date.now().toString(),
				role: "user",
				display: message,
			},
		]);
		(e.target as HTMLFormElement).reset();

		try {
			const response = await sendMessage(message);
			setMessages((messages) => [
				...messages,
				{
					id: Date.now().toString(),
					role: "assistant",
					display: response?.text,
				},
			]);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Flex direction="column" height="100%">
			<Box style={{flex: 1}} overflowY="auto">
				<Flex direction="column" justify="end">
					{messages.map((message: ClientMessage) => (
						<div key={message.id}>{message.display}</div>
					))}
				</Flex>
			</Box>
			<Flex asChild direction="row" gap="2">
				<form onSubmit={handleSubmit}>
					<Box style={{flex: 1}}>
						<TextField.Root name="message" autoFocus />
					</Box>
					<Button variant="soft" type="submit">
						Send
					</Button>
				</form>
			</Flex>
		</Flex>
	);
}
