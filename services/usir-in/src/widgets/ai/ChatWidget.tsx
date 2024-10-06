import {Chat} from "./Chat";
import {ChatAIContext} from "./context";

export function ChatWidget() {
	console.log(ChatAIContext);
	return (
		<ChatAIContext>
			<Chat />
		</ChatAIContext>
	);
}
