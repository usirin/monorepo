import type {Tid} from "./pid";

/**
 * A type that can be resolved to a value or a promise.
 */
export type Thenable<T> = T | PromiseLike<T>;

export type Pid = Tid<"process">;

type Message<Topic extends string = string> = {topic: Topic};

export interface Kernel {
	spawn: (fn: (ctx: ProcessContext) => Thenable<void>) => readonly [Pid, Promise<void>];
	send: <TMessage>(pid: Pid, msg: TMessage) => void;
	receive: <TMessage extends Message>(pid: Pid, fn: (payload: TMessage) => void) => void;
}

export interface ProcessContext {
	receive: <TMessage extends Message>(fn: (payload: TMessage) => void) => void;
}
