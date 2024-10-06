import {describe, expect, it} from "bun:test";
import {Mailbox} from "./mailbox";
import type {Message} from "./types";

describe("Mailbox", () => {
	it("should be able to enqueue and dequeue messages", () => {
		const mb = new Mailbox<
			Message<"increment", {count: number}> | Message<"decrement", {count: number}>
		>();

		mb.enqueue({topic: "increment", payload: {count: 1}});
		mb.enqueue({topic: "decrement", payload: {count: 1}});
		mb.enqueue({topic: "increment", payload: {count: 2}});
		mb.enqueue({topic: "decrement", payload: {count: 2}});
		mb.enqueue({topic: "decrement", payload: {count: 3}});

		expect(mb.dequeue("increment")).toEqual({topic: "increment", payload: {count: 1}});
		expect(mb.dequeue("increment")).toEqual({topic: "increment", payload: {count: 2}});
		expect(mb.dequeue("decrement")).toEqual({topic: "decrement", payload: {count: 1}});
		expect(mb.dequeue("decrement")).toEqual({topic: "decrement", payload: {count: 2}});
		expect(mb.dequeue("decrement")).toEqual({topic: "decrement", payload: {count: 3}});
	});
});
