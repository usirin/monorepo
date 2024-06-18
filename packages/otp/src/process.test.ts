// process.test.ts
import {expect, test} from "bun:test";
import {tid} from "./pid";
import {Process} from "./process";

test("Process sends and receives messages correctly", () => {
	const process = new Process({
		pid: tid("process"),
		fn: async () => {},
		context: {receive: () => {}},
	});

	let receivedMessage: {topic: string};
	process.on("message", (msg) => {
		receivedMessage = msg;
	});

	process.send({topic: "hello"});
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	expect(receivedMessage!.topic).toBe("hello");
});

test("Process starts and executes function", async () => {
	let executed = false;
	const process = new Process({
		pid: tid("process"),
		fn: async () => {
			executed = true;
		},
		context: {receive: () => {}},
	});

	await process.start();
	expect(executed).toBe(true);
});
