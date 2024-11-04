"use client";

import {Box} from "@radix-ui/themes";
import {useEffect} from "react";
import {create} from "zustand";

interface CountState {
	count: number;
	actions: {
		increment: () => void;
	};
}

export const useStore = create<CountState>()((set) => ({
	count: 0,
	actions: {
		increment: () => set((state) => ({count: state.count + 1})),
	},
}));

export function Counter() {
	const count = useStore((state) => state.count);
	const increment = useStore((state) => state.actions.increment);
	useEffect(() => {
		const interval = setInterval(() => {
			increment();
		}, 1000);
		return () => clearInterval(interval);
	}, []);
	return <Box>{count}</Box>;
}
