const readable = new ReadableStream({
	start(controller) {
		controller.enqueue("Hello");
		controller.enqueue(" ");
		controller.enqueue("World");
		controller.close();
	},
});

async function* getAsyncItarableFor<T>(readable: ReadableStream<T>) {
	const reader = readable.getReader();
	try {
		while (true) {
			const {done, value} = await reader.read();
			if (done) break;
			yield value;
		}
	} finally {
		reader.releaseLock();
	}
}

for await (const chunk of getAsyncItarableFor(readable)) {
	console.log(chunk);
}
