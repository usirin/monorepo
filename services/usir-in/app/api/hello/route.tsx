import * as path from "node:path";
import * as utils from "node:util";
// @ts-ignore
import {renderToReadableStream} from "react-server-dom-webpack/server.edge";
import {Counter} from "~/src/widgets/Counter";

import "../../../.next/server/app/page_client-reference-manifest.js";

console.log(">>>>>>>>>", globalThis);

const clientRefsPath = path.resolve("../../../.next/server/app/page_client-reference-manifest.js");

export const GET = () => {
	console.dir(">>>>>>>>>", utils.inspect(globalThis, false, null, true));
	return new Response(
		renderToReadableStream(<Counter />, globalThis.__RSC_MANIFEST["/page"].clientModules),
	);
};
