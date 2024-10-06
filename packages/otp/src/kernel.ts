import waitFor from "p-wait-for";
import {tid} from "./pid";
import {Process} from "./process";
import type {Kernel as KernelType, Message, ProcessContext, Thenable} from "./types";

export class Kernel implements KernelType {
	processes: Map<string, Process> = new Map();

	spawn(fn: (ctx: ProcessContext) => Thenable<void>) {
		const pid = tid("process");

		const proc = new Process({pid, fn});
		this.processes.set(proc.pid, proc);

		const context: ProcessContext = {
			pid,
			receive: async (topic, fn) => {
				console.log("waiting for topic", topic);
				const message = await waitFor(() => {
					const message = proc.mailbox.dequeue(topic);
					return !!message && waitFor.resolveWith(message);
				});
				console.log("received topic", topic);
				fn(message as any);
			},
		};

		const promise = proc.start(context);

		promise.finally(() => {
			this.processes.delete(proc.pid);
		});

		return [proc.pid, promise] as const;
	}

	send<TMessage extends Message>(pid: string, msg: TMessage) {
		console.log("Sending", msg.topic, pid);
		const proc = this.processes.get(pid);
		if (proc) {
			proc.mailbox.enqueue(msg);
		}
	}
}

const kernel = new Kernel();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const [pid, promise] = kernel.spawn(async ({receive}) => {
	const state = {count: 0};

	const loop = async () => {
		receive("inc", () => {
			state.count++;

			console.log("inc result:", state.count);
			loop();
		});

		receive("hello", () => {
			console.log("hello");
			loop();
		});
	};

	loop();
});

console.log(kernel.processes.keys());

kernel.send(pid, {topic: "hello"});
console.log(1);
// kernel.send(pid, {topic: "inc"});
// console.log(2);
// kernel.send(pid, {topic: "inc"});
// console.log(3);
// kernel.send(pid, {topic: "inc"});
// console.log(4);
// kernel.send(pid, {topic: "hello"});
// console.log(5);

wait(2000).then(() => {
	console.log("inside wait");
	kernel.send(pid, {topic: "inc"});
});

promise.then(() => {
	console.log("Done", pid);
	console.log(kernel.processes.keys());
});
