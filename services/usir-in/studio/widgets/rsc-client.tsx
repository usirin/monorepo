"use client";

import {use, useEffect, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
// @ts-expect-error
import {createFromFetch} from "react-server-dom-webpack/client";

export function RSCClient() {
	const [promise, setPromise] = useState<Promise<Response> | null>(null);
	useEffect(() => {
		setPromise(createFromFetch(fetch("/api/hello")));
	}, []);

	if (!promise) {
		return null;
	}

	return <WidgetRoot promise={promise} />;
}

function WidgetRoot({promise}: {promise: Promise<Response>}) {
	return <>{use(promise)}</>;
}
