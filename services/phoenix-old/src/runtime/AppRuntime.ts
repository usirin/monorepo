/**
 * Application runtime with Effect services
 */

import {Layer, ManagedRuntime} from "effect";
import {HistoryService} from "../router/HistoryService.js";
import {SimpleRouterService} from "../router/SimpleRouterService.js";

export const AppRuntime = ManagedRuntime.make(
	Layer.mergeAll(HistoryService.Default, SimpleRouterService.Default),
);
