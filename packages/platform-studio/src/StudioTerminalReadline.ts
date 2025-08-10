import * as Effect from "effect/Effect";
import * as SubscriptionRef from "effect/SubscriptionRef";

export class StudioTerminalReadline extends Effect.Service<StudioTerminalReadline>()(
	"StudioTerminalReadline",
	{effect: SubscriptionRef.make<string>("")},
) {}
