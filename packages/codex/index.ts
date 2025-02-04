// biome-ignore lint/suspicious/noEmptyInterface: this is gonna be extended dynamically
export interface CodexContext {}

// Plugin types with generic dependencies
interface Plugin<
	TDeps extends (keyof CodexContext)[] = (keyof CodexContext)[],
	TResult = CodexContext[keyof CodexContext],
> {
	name: string;
	version: string;
	dependencies?: TDeps;
	register: (
		deps: {
			[K in TDeps[number]]: CodexContext[K];
		},
	) => Promise<TResult> | TResult;
}

// Create codex instance
export function createCodex() {
	const plugins = new Map<string, Plugin>();
	const results = new Map<string, CodexContext[keyof CodexContext]>();

	return {
		async use<TPlugin extends Plugin>(newPlugins: TPlugin[]) {
			for (const plugin of newPlugins) {
				plugins.set(plugin.name, plugin);
			}
			return this;
		},

		async init() {
			async function registerPlugin(name: string, chain: string[] = []) {
				if (chain.includes(name)) {
					throw new Error(`Circular dependency detected: ${[...chain, name].join(" -> ")}`);
				}

				if (results.has(name)) {
					return results.get(name);
				}

				const plugin = plugins.get(name);
				if (!plugin) throw new Error(`Plugin not found: ${name}`);

				// Get dependencies' results
				const deps = {} as Record<string, any>;
				if (plugin.dependencies) {
					for (const dep of plugin.dependencies) {
						const result = await registerPlugin(dep, [...chain, name]);
						deps[dep] = result;
					}
				}

				// Register plugin with dependencies' results
				const result = await plugin.register(deps as any);
				results.set(name, result);

				return result;
			}

			let context = {} as CodexContext;
			for (const plugin of plugins.values()) {
				const result = await registerPlugin(plugin.name);
				if (result) context = {...context, [plugin.name]: result};
			}

			return context;
		},
	};
}

// Helper to define plugins with inferred dependency types
export function definePlugin<TDeps extends (keyof CodexContext)[], TResult>(config: {
	name: string;
	version: string;
	dependencies?: TDeps;
	register: (
		deps: {
			[K in TDeps[number]]: CodexContext[K];
		},
	) => Promise<TResult> | TResult;
}): Plugin<TDeps, TResult> {
	return config;
}
