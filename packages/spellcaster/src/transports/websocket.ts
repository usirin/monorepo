import type {WebSocket} from "ws";
import * as Transport from "../transport";

export function createServerWebSocketTransport(ws: WebSocket) {
	return Transport.createServerTransport({
		// expect incoming messages from the client
		incoming: new ReadableStream<Transport.Request>({
			start(controller) {
				ws.addEventListener("message", (event) => {
					const message = JSON.parse(event.data.toString());
					controller.enqueue(message);
				});
			},
		}),
		// send outgoing messages to the client
		outgoing: new WritableStream<Transport.Response>({
			write(response) {
				ws.send(JSON.stringify(response));
			},
		}),
	});
}

export function createClientWebSocketTransport(ws: WebSocket) {
	return Transport.createClientTransport({
		// expect incoming responses from the server
		incoming: new ReadableStream<Transport.Response>({
			start(controller) {
				ws.addEventListener("message", (event) => {
					const message = JSON.parse(event.data.toString());
					controller.enqueue(message);
				});
			},
		}),
		// send outgoing requests to the server
		outgoing: new WritableStream<Transport.Request>({
			write(request) {
				ws.send(JSON.stringify(request));
			},
		}),
	});
}
