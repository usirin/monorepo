import {Layer, ManagedRuntime} from "effect";
import {createBrowserHistory} from "history";
import {createRouter} from "radix3";

import * as History from "./History";
import * as Router from "./Router";

const AllLayers = Layer.mergeAll(
	// Register router
	Router.layer(() => createRouter()),
	History.layer(() => createBrowserHistory()),
);

export const make = () => ManagedRuntime.make(AllLayers);
