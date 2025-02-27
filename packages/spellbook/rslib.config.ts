import {defineConfig} from "@rslib/core";

export default defineConfig({
	lib: [
		{
			format: "esm",
			syntax: "es2021",
			dts: {
				bundle: false,
			},
			bundle: false,
		},
	],
	source: {
		exclude: ["**/*.test.ts", "**/*playground*"],
		entry: {
			index: ["./src/**", "!**/*.test.ts", "!**/*playground*"],
		},
	},
});
