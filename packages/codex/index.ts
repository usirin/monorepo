// Base module declaration
declare module "." {
	export interface CodexContext {}
}

// Plugin types with generic dependencies
interface Plugin<TDeps extends (keyof CodexContext)[] = (keyof CodexContext)[]> {
	name: string;
	version: string;
	dependencies?: TDeps;
	register: (
		deps: {
			[K in TDeps[number]]: CodexContext[K];
		},
	) => Promise<Partial<CodexContext>> | Partial<CodexContext>;
}

// Create codex instance
export function createCodex() {
	const plugins = new Map<string, Plugin>();
	const results = new Map<string, Partial<CodexContext>>();

	return {
		async use<TPlugin extends Plugin>(newPlugins: TPlugin[]) {
			for (const plugin of newPlugins) {
				plugins.set(plugin.name, plugin);
			}
			return this;
		},

		async init() {
			async function registerPlugin(name: string) {
				// Already registered
				if (results.has(name)) {
					return results.get(name);
				}

				const plugin = plugins.get(name);
				if (!plugin) throw new Error(`Plugin not found: ${name}`);

				// Get dependencies' results
				const deps = {} as Record<string, Partial<CodexContext>>;
				if (plugin.dependencies) {
					for (const dep of plugin.dependencies) {
						const result = await registerPlugin(dep);
						if (result) deps[dep] = result;
					}
				}

				// Register plugin with dependencies' results
				const result = await plugin.register(deps);
				results.set(name, result);

				return result;
			}

			const context = {} as CodexContext;
			for (const plugin of plugins.values()) {
				const result = await registerPlugin(plugin.name);
				if (result) Object.assign(context, result);
			}

			return context;
		},
	};
}

// Helper to define plugins with inferred dependency types
export function definePlugin<TDeps extends (keyof CodexContext)[]>(config: {
	name: string;
	version: string;
	dependencies?: TDeps;
	register: (
		deps: {
			[K in TDeps[number]]: CodexContext[K];
		},
	) => Promise<Partial<CodexContext>> | Partial<CodexContext>;
}): Plugin<TDeps> {
	return config;
}
