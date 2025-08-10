import * as Effect from "effect/Effect";
import * as SubscriptionRef from "effect/SubscriptionRef";

export class StudioTerminalOutput extends Effect.Service<StudioTerminalOutput>()(
	"StudioTerminalOutput",
	{effect: SubscriptionRef.make<string[]>([])},
) {}
