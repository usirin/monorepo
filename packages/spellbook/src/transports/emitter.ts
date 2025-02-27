import {EventEmitter} from "node:events";
import * as Transport from "../transport";

export function createEmitterPair() {
	const client = new EventEmitter();
	const server = new EventEmitter();

	client.on("request", (data) => {
		server.emit("request", data);
	});

	server.on("response", (data) => {
		client.emit("response", data);
	});

	return [client, server];
}

export function createServerTransport(emitter: EventEmitter) {
	return Transport.createServerTransport({
		incoming: new ReadableStream<Transport.Request>({
			start(controller) {
				emitter.on("request", (data: string | Uint8Array) => {
					const message = JSON.parse(data.toString());
					controller.enqueue(message);
				});
			},
		}),
		outgoing: new WritableStream<Transport.Response>({
			write(response) {
				emitter.emit("response", JSON.stringify(response));
			},
		}),
	});
}

export function createClientTransport(emitter: EventEmitter) {
	return Transport.createClientTransport({
		incoming: new ReadableStream<Transport.Response>({
			start(controller) {
				emitter.on("response", (data: string | Uint8Array) => {
					const message = JSON.parse(data.toString());
					controller.enqueue(message);
				});
			},
		}),
		outgoing: new WritableStream<Transport.Request>({
			write(request) {
				emitter.emit("request", JSON.stringify(request));
			},
		}),
	});
}
