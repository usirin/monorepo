import {definePlugin} from "@umut/codex";
import {Context, Effect, pipe} from "effect";
import {RunekeeperService} from "../runekeeper-manager";
import {WorkspaceService} from "../workspace-manager";

const runekeeperPlugin = definePlugin({
	name: "runekeeper",
	version: "1.0.0",
	register: Effect.gen(function* (_) {
		const runekeeper = RunekeeperService.of({
			map: (mode, key, command) =>
				Effect.sync(() => {
					// Command palette logic
				}),
		});

		return runekeeper;
	}),
});

const workspacePlugin = definePlugin({
	name: "workspace",
	version: "1.0.0",
	dependencies: new Set(["runekeeper"]),
	register: Effect.gen(function* (_) {
		const runekeeper = yield* Effect.serviceSync(RunekeeperService);
		const workspace = WorkspaceService.of({
			splitVertical: () =>
				Effect.sync(() => {
					// Split logic
				}),
		});

		yield* runekeeper.map("normal", "<c-w>v", workspace.splitVertical);

		return workspace;
	}),
});

// Initialize studio
const initStudio = Effect.gen(function* (_) {
	const codex = yield* Effect.serviceSync(PluginService);

	yield* codex.register(runekeeperPlugin);
	yield* codex.register(workspacePlugin);

	return yield* codex.init();
});

// Use in your React component
export function Studio() {
	const [studio, setStudio] = useState<Awaited<ReturnType<typeof initStudio>>>();

	useEffect(() => {
		Effect.runPromise(
			initStudio.pipe(Effect.provideService(PluginService, new PluginServiceLive())),
		).then(setStudio);

		return () => {
			Effect.runPromise(
				pipe(
					Effect.serviceSync(PluginService),
					Effect.flatMap((codex) => codex.cleanup()),
				),
			);
		};
	}, []);

	if (!studio) return null;

	return (
		<StudioContext.Provider value={studio}>
			<Container />
		</StudioContext.Provider>
	);
}
