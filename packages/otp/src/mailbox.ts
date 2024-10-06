import type {Message} from "./types";

export class Mailbox<TMessage extends Message> {
	messages: TMessage[] = [];

	enqueue(message: TMessage) {
		this.messages.push(message);
	}

	dequeue(topic?: TMessage["topic"]) {
		if (!topic) {
			return this.messages.shift() ?? null;
		}

		const message = this.messages.find((msg) => msg.topic === topic);
		if (!message) {
			return null;
		}

		this.messages = this.messages.filter((msg) => msg !== message);
		return message;
	}
}
