"use client";

import {useChat} from "@ai-sdk/react";
import {Box, ScrollArea, TextField} from "@radix-ui/themes";
import Markdown from "react-markdown";
import {create} from "zustand";
import {createJSONStorage, devtools, persist} from "zustand/middleware";
import {immer} from "zustand/middleware/immer";

interface ChatState {
	messages: {id: string; role: "system" | "user" | "assistant" | "data"; content: string}[];
	input: string;
}

export const useChatStore = create<ChatState>()(
	devtools(
		persist(
			immer<ChatState>(() => ({
				messages: [],
				input: "",
			})),
			{
				name: "chat-store",
				storage: createJSONStorage(() => localStorage),
			},
		),
	),
);

export function Chat() {
	const {messages, input, handleInputChange, handleSubmit} = useChat({
		initialMessages: useChatStore.getState().messages,
		onFinish: (message) => {
			useChatStore.setState({messages: [...useChatStore.getState().messages, message]});
		},
	});

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		useChatStore.setState({input: event.target.value});
		handleInputChange(event);
	};

	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		useChatStore.setState({
			messages: [
				...useChatStore.getState().messages,
				{id: Date.now().toString(), role: "user", content: input},
			],
		});
		handleSubmit(event);
		useChatStore.setState({input: ""});
	};

	return (
		<div style={{position: "relative"}}>
			{messages.map((m) => (
				<div key={m.id}>
					<Markdown>
						{(m.role === "user"
							? "User: "
							: m.role === "assistant"
								? "AI: "
								: m.role === "system"
									? "System: "
									: "Data: ") + m.content}
					</Markdown>
				</div>
			))}

			<form
				onSubmit={onSubmit}
				style={{position: "absolute", bottom: 0, right: 0, left: 0, backgroundColor: "black"}}
			>
				<TextField.Root value={input} placeholder="Say something..." onChange={onChange} />
			</form>
		</div>
	);
}
