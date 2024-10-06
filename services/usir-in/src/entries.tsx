import {AsyncLocalStorage} from "node:async_hooks";
import {defineEntries} from "waku/server";

import App from "./App";
import {widgets} from "./widgets";

const sessionStorage = new AsyncLocalStorage<number>();
let count = 0;

export default defineEntries(
	// renderEntries
	async (input) => {
		return sessionStorage.run(count++, async () => {
			// biome-ignore lint/style/noNonNullAssertion: we are inside localStorage.run
			const count = sessionStorage.getStore()!;
			console.log("count", count);

			return {
				App: <App name={input || "usir.in"} />,

				...widgets,
			};
		});
	},
);
