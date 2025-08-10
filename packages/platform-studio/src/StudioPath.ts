import {BadArgument} from "@effect/platform/Error";
import {Path, TypeId} from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import BrowserifyPath from "path-browserify";

const fromFileUrl = (url: URL): Effect.Effect<string, BadArgument> =>
	Effect.try({
		try: () => {
			if (url.protocol !== "file:") throw new TypeError("Must be file: protocol.");
			return decodeURIComponent(url.pathname);
		},
		catch: (error) =>
			new BadArgument({
				module: "Path",
				method: "fromFileUrl",
				description: `Invalid file URL: ${url}`,
				cause: error,
			}),
	});

const toFileUrl = (path: string): Effect.Effect<URL, BadArgument> =>
	Effect.try({
		try: () => {
			if (!BrowserifyPath.isAbsolute(path)) throw new TypeError("Path must be absolute");
			return new URL(`file://${path}`);
		},
		catch: (error) =>
			new BadArgument({
				module: "Path",
				method: "toFileUrl",
				description: `Invalid path: ${path}`,
				cause: error,
			}),
	});

/** @internal */
export const layer = Layer.succeed(
	Path,
	Path.of({
		[TypeId]: TypeId,
		...BrowserifyPath,
		fromFileUrl,
		toFileUrl,
		toNamespacedPath: (path: string) => path,
	}),
);
