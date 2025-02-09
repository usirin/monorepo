import type {Message, Pid, ProcessContext, Thenable} from "./types";

import {EventEmitter} from "node:events";

interface Props {
	pid: Pid;
	fn: (ctx: ProcessContext) => Thenable<void>;
}

export class Process extends EventEmitter {
	pid: Pid;

	fn: (ctx: ProcessContext) => Thenable<void>;
	mailbox: Mailbox;

	constructor({pid, fn}: Props) {
		super();
		this.pid = pid;
		this.fn = fn;
		this.mailbox = new Mailbox();
	}

	send<TMessage extends Message>(msg: TMessage) {
		this.mailbox.enqueue(msg);
	}

	// TODO: injecd the context here instead of the constructor
	start(context: ProcessContext) {
		return Promise.resolve(this.fn(context));
	}
}

// Mailbox is a queue of messages
// that are sent to a process
class Mailbox<TMessage extends Message = Message> {
	messages: TMessage[] = [];
	enqueue(message: TMessage) {
		this.messages.push(message);
	}

	dequeue(topic: string) {
		const index = this.messages.findIndex((msg) => msg.topic === topic);
		if (index === -1) {
			return null;
		}

		const message = this.messages[index];
		this.messages = this.messages.filter((_, i) => i !== index);

		return message;
	}
}
