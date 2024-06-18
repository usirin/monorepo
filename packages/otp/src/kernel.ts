import {tid} from "./pid";
import {Process} from "./process";
import type {Kernel as KernelType, Pid, ProcessContext, Thenable} from "./types";

export class Kernel implements KernelType {
	processes: Map<string, Process> = new Map();

	spawn(fn: (ctx: ProcessContext) => Thenable<void>) {
		const pid = tid("process");

		const proc = new Process({pid, fn});
		this.processes.set(proc.pid, proc);

		const context: ProcessContext = {
			receive: (fn) => {
				this.receive(pid, fn);
			},
		};

		const promise = proc.start(context);

		promise.finally(() => {
			this.processes.delete(proc.pid);
		});

		return [proc.pid, promise] as const;
	}

	receive<TMessage extends {topic: string}>(pid: Pid, fn: (message: TMessage) => void) {
		const proc = this.processes.get(pid);

		if (!proc) {
			throw new Error("Process not found");
		}

		proc.once("message", (message) => {
			fn(message as TMessage);
			this.receive(pid, fn);
		});
	}

	send<TMessage>(pid: string, msg: TMessage) {
		const proc = this.processes.get(pid);
		if (proc) {
			proc.send(msg);
		}
	}
}

const kernel = new Kernel();

const [pid, promise] = kernel.spawn(async ({receive}) => {
	const state = {count: 0};
	receive((message) => {
		console.log("Received", message);
		if (message.topic === "inc") {
			state.count++;
		}

		console.log("State", state);
	});
});

console.log(kernel.processes.keys());

kernel.send(pid, {topic: "hello"});
kernel.send(pid, {topic: "inc"});
kernel.send(pid, {topic: "inc"});
kernel.send(pid, {topic: "inc"});
kernel.send(pid, {topic: "hello"});

promise.then(() => {
	console.log("Done", pid);
	console.log(kernel.processes.keys());
});
