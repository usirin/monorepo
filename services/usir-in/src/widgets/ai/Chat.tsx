"use client";

import {useUIState} from "ai/rsc";
import {type ClientMessage, sendMessage} from "./actions";
import type {AI} from "./context";

export function Chat() {
	const [messages, setMessages] = useUIState<typeof AI>();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const message = (e.target as HTMLFormElement).message.value;

		setMessages([
			...messages,
			{
				id: Date.now().toString(),
				role: "user",
				display: message,
			},
		]);
		(e.target as HTMLFormElement).reset();

		const response = await sendMessage(message);

		setMessages([
			...messages,
			{
				id: Date.now().toString(),
				role: "assistant",
				display: response.text,
			},
		]);
	};

	return (
		<>
			<ul>
				{messages.map((message: ClientMessage) => (
					<li key={message.id}>{message.display}</li>
				))}
			</ul>
			<form onSubmit={handleSubmit}>
				<input type="text" name="message" />
				<button type="submit">Send</button>
			</form>
		</>
	);
}
