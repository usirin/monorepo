import type {Tid} from "./pid";

/**
 * A type that can be resolved to a value or a promise.
 */
export type Thenable<T> = T | PromiseLike<T>;

export type Pid = Tid<"process">;

export type Message<Topic extends string = string, TPayload = undefined> = {
	topic: Topic;
} & (TPayload extends undefined ? {} : {payload: TPayload});

export interface Kernel {
	spawn: (fn: (ctx: ProcessContext) => Thenable<void>) => readonly [Pid, Promise<void>];
	send: <TMessage extends Message>(pid: Pid, msg: TMessage) => void;
}

export interface ProcessContext {
	pid: Pid;
	receive: <TTopic extends string, TMessage extends Message<TTopic>>(
		topic: TTopic,
		fn: (payload: TMessage) => void,
	) => Thenable<void>;
}
