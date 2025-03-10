"use client";

import {useChat} from "@ai-sdk/react";
import {TextField} from "@radix-ui/themes";

export function Chat() {
	const {messages, input, handleInputChange, handleSubmit} = useChat();
	return (
		<div>
			{messages.map((m) => (
				<div key={m.id}>
					{m.role === "user" ? "User: " : "AI: "}
					{m.content}
				</div>
			))}

			<form onSubmit={handleSubmit}>
				<TextField.Root value={input} placeholder="Say something..." onChange={handleInputChange} />
			</form>
		</div>
	);
}
