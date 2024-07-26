import {Box, Text, render, useApp, useInput} from "ink";
import TextInput from "ink-text-input";
import React from "react";
import {Conversation} from "./lib/conversation";
import {anthropic, groq} from "./models";

const renderPrompt = () => process.stdout.write("\n> ");

renderPrompt();

const conversation = new Conversation({
	model: groq("llama-3.1-70b-versatile"),
	messages: [],
});

for await (const line of console) {
	console.log(`line: ${line}`);

	const result = await conversation.stream(line);

	for await (const textPart of result.textStream) {
		process.stdout.write(textPart);
	}
	renderPrompt();
}

// function Robot() {
// 	const {exit} = useApp();
// 	const [query, setQuery] = React.useState("");
//
// 	return (
// 		<Box flexDirection="column">
// 			<Box>
// 				<Text>&gt; </Text>
// 				<TextInput value={query} onChange={setQuery} onSubmit={() => setQuery("")} />
// 			</Box>
// 		</Box>
// 	);
// }
//
// render(<Robot />);
