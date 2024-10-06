"use client";

import {useEffect, useState} from "react";

export function Time() {
	const [time, setTime] = useState(new Date());
	useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date());
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	return <div>{time.toLocaleTimeString()}</div>;
}
