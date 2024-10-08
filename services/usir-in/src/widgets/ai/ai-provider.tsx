import {ErrorBoundary} from "react-error-boundary";

import {Suspense} from "react";
import {AI} from "./context";

export function AIProvider({children}: {children: React.ReactNode}) {
	return (
		<AI>
			<ErrorBoundary fallback={<div>Error</div>}>
				<Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
			</ErrorBoundary>
		</AI>
	);
}
