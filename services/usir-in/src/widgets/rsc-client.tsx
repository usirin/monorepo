"use client";

import {use, useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
// @ts-expect-error
import {createFromFetch} from "react-server-dom-webpack/client";

export function RSCClient() {
	const elementRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		if (elementRef.current) {
			const promise = createFromFetch(fetch("/api/hello"));
			const root = createRoot(elementRef.current);
			root.render(<WidgetRoot promise={promise} />);
		}
	}, []);

	return <div ref={elementRef} />;
}

function WidgetRoot({promise}: {promise: Promise<Response>}) {
	return <>{use(promise)}</>;
}
