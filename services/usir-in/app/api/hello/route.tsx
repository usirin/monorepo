// @ts-ignore
import {renderToReadableStream} from "react-server-dom-webpack/server.edge";

export const GET = () => {
	return new Response(renderToReadableStream(<div>Hello, world!</div>));
};
