import type * as Terminal from "@effect/platform/Terminal";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as SubscriptionRef from "effect/SubscriptionRef";

export class StudioTerminalInput extends Effect.Service<StudioTerminalInput>()(
	"StudioTerminalInput",
	{
		effect: SubscriptionRef.make<Terminal.UserInput>({
			input: Option.none(),
			key: {name: "", ctrl: false, meta: false, shift: false},
		}),
	},
) {}
