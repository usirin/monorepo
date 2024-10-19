"use client";
import {create} from "zustand";

interface CommandPanelState {
	status: "open" | "closed";
}

export const useStatusbarStore = create<CommandPanelState>(() => ({
	status: "closed",
}));

export const toggle = () =>
	useStatusbarStore.setState((state) => ({status: state.status === "open" ? "closed" : "open"}));

export function CommandPanel() {
	const status = useStatusbarStore((state) => state.status);

	if (status === "closed") {
		return null;
	}

	return <div>CommandPanel</div>;
}
