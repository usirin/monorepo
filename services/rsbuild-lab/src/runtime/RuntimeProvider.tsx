import type {ManagedRuntime} from "effect";
import type React from "react";
import {createContext, useContext} from "react";

// Define the context type based on our service layer
type AppServices = typeof import("../services/ServiceLayer.js").SharedServiceLayer.Success;

// Create React context for the runtime
const RuntimeContext = createContext<ManagedRuntime.ManagedRuntime<AppServices, never> | null>(
	null,
);

export interface RuntimeProviderProps {
	runtime: ManagedRuntime.ManagedRuntime<AppServices, never>;
	children: React.ReactNode;
}

// Provider component that makes the runtime available to all children
export const RuntimeProvider: React.FC<RuntimeProviderProps> = ({runtime, children}) => {
	return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>;
};

// Hook to access the runtime from any component
export const useRuntime = () => {
	const runtime = useContext(RuntimeContext);
	if (!runtime) {
		throw new Error("useRuntime must be used within a RuntimeProvider");
	}
	return runtime;
};
