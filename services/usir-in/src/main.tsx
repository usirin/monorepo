import {StrictMode} from "react";
import {createRoot, hydrateRoot} from "react-dom/client";
import {Root, Slot} from "waku/client";

const rootElement = (
	<StrictMode>
		<Root>
			<Slot id="App" />
		</Root>
	</StrictMode>
);

// biome-ignore lint/suspicious/noExplicitAny: we are hydrating in a browser
if ((globalThis as any).__WAKU_HYDRATE__) {
	hydrateRoot(document, rootElement);
} else {
	// biome-ignore lint/suspicious/noExplicitAny: we are rendering in a browser
	createRoot(document as any).render(rootElement);
}
