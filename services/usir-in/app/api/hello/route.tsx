import * as path from "node:path";
import * as utils from "node:util";
// @ts-ignore
import {renderToReadableStream} from "react-server-dom-webpack/server.edge";
import {Counter} from "~/studio/widgets/Counter.jsx";

import "../../../.next/server/app/page_client-reference-manifest.js";

export const GET = () => {
	console.dir(">>>>>>>>>", utils.inspect(globalThis, false, null, true));
	return <Counter />;
};
