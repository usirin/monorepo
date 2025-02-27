import {describe, expect, it} from "bun:test";
import {z} from "zod";
import {type Ref, factory, struct} from ".";

describe("factory", () => {
	it("should work", () => {
		const createTest = factory("test", (a: number) => ({a}));
		const e = createTest(1);
		expect(e.tag).toEqual("test");
		expect(e.a).toEqual(1);
	});
});

describe("relationships", () => {
	it("should work with References", () => {
		const createPost = factory("post", (title: string, body: string) => ({title, body}));
		type PostEntity = ReturnType<typeof createPost>;
		const post = createPost("Hello World", "This is my first post");

		const createComment = factory("comment", (postID: Ref<PostEntity>, text: string) => ({
			postID,
			text,
		}));
		const comment = createComment(post.id, "Great post!");
		expect(comment.postID).toEqual(post.id);
		expect(comment.text).toEqual("Great post!");
	});
});

describe("struct", () => {
	it("should work", async () => {
		const createUser = struct("user", z.object({name: z.string()}));
		const user = createUser({name: "John Doe"});
		expect(user.name).toEqual("John Doe");
	});

	it("should only work with object schemas", () => {
		// @ts-expect-error
		const createUser = struct("user", z.string());
		expect(() => createUser({name: "John Doe"})).toThrow();
	});
});
