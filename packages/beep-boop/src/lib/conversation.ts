import {EventEmitter} from "node:events";
import {type CoreMessage, type LanguageModel, streamText} from "ai";

interface ConversationProps {
	model: LanguageModel;
	messages: CoreMessage[];
	system?: string;
}

export class Conversation extends EventEmitter {
	messages: CoreMessage[];
	model: LanguageModel;
	system: string | undefined;

	constructor(props: ConversationProps) {
		super();
		this.model = props.model;
		this.messages = props.messages;
		this.system = props.system;
	}

	stream(prompt: string) {
		this.messages.push({role: "user", content: prompt});
		return streamText({
			model: this.model,
			system: this.system,
			messages: this.messages,
			onFinish: (result) => {
				this.messages.push({role: "assistant", content: result.text});
			},
		});
	}
}
