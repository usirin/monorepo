import {defineConfig} from "@rslib/core";

export default defineConfig({
	lib: [
		{
			format: "esm",
			syntax: "es2021",
			dts: true,
			bundle: false,
		},
	],
	source: {
		exclude: ["**/*.test.ts"],
		entry: {
			index: ["./src/**", "!**/*.test.ts"],
		},
	},
});
