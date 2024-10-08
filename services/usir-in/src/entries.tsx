import {AsyncLocalStorage} from "node:async_hooks";
import {defineEntries} from "waku/server";

import {Slot} from "waku/client";
import App from "./App";
import {widgets} from "./widgets";

const sessionStorage = new AsyncLocalStorage<number>();
let count = 0;

export default defineEntries(
	// renderEntries
	async (rscPath) => {
		return sessionStorage.run(count++, async () => {
			// biome-ignore lint/style/noNonNullAssertion: we are inside localStorage.run
			const count = sessionStorage.getStore()!;
			console.log("count", count);

			return {
				App: <App name={rscPath || "usir.in"} />,

				...widgets,
			};
		});
	},
	// getBuildConfig
	async () => [{pathname: "/", entries: [{rscPath: ""}]}],
	// getSsrConfig
	async (pathname) => {
		switch (pathname) {
			case "/":
				return {
					rscPath: "",
					html: <Slot id="App" />,
				};
			default:
				return null;
		}
	},
);
