import type {Tid} from "./pid";
import type {ProcessContext, Thenable} from "./types";

import {EventEmitter} from "node:events";

interface Props {
	pid: Tid<"process">;
	fn: (ctx: ProcessContext) => Thenable<void>;
}

export class Process extends EventEmitter {
	pid: Tid<"process">;

	fn: (ctx: ProcessContext) => Thenable<void>;

	constructor({pid, fn}: Props) {
		super();
		this.pid = pid;
		this.fn = fn;
	}

	send<TMessage>(msg: TMessage) {
		this.emit("message", msg);
	}

	// TODO: injecd the context here instead of the constructor
	start(context: ProcessContext) {
		return Promise.resolve(this.fn(context));
	}
}
