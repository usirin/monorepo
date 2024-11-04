import {Chat} from "./Chat";
import {AIProvider} from "./ai-provider";

export function ChatWidget() {
	return (
		<AIProvider>
			<Chat />
		</AIProvider>
	);
}
