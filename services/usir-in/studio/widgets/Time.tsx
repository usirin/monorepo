"use client";

import {useEffect, useState} from "react";

import {useLocation} from "react-router";
import {create} from "zustand";
interface TimeState {
	time: Date;
	actions: {
		setTime: (time: Date) => void;
	};
}

export const useStore = create<TimeState>()((set) => ({
	time: new Date(),
	actions: {
		setTime: (time) => set(() => ({time: time})),
	},
}));

export function Time() {
	const time = useStore((state) => state.time);
	const setTime = useStore((state) => state.actions.setTime);

	const location = useLocation();

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}, [setTime]);

	return (
		<div>
			{time.toLocaleTimeString()}
			<div>{JSON.stringify(location)}</div>
		</div>
	);
}
