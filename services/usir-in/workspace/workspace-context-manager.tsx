import type {StackPath} from "@umut/layout-tree";
import {type PropsWithChildren, createContext, useContext, useEffect} from "react";
import type {WorkspaceID, WorkspaceState} from "./workspace-registry";

interface WorkspaceContextValue {
	id: WorkspaceID;
	state: WorkspaceState;
	actions: {
		setFocused: (path: StackPath) => void;
	};
}

// Context
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

interface WorkspaceProps {
	id: WorkspaceID;
	initialState?: Partial<WorkspaceState>;
}

// Provider
export function WorkspaceProvider({children, workspace}: PropsWithChildren<WorkspaceProps>) {
	return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// Base Hook
export function useWorkspaceContext(): WorkspaceContextValue {
	const context = useContext(WorkspaceContext);
	if (!context) {
		throw new Error("useWorkspaceContext must be used within WorkspaceProvider");
	}
	return context;
}

// Utility Hooks
export function useWorkspaceState(): WorkspaceState {
	return useWorkspaceContext().state;
}

export function useWorkspaceActions() {
	return useWorkspaceContext().actions;
}

// Export types
export type {WorkspaceState};
