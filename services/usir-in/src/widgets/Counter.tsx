"use client";

import {Box} from "@radix-ui/themes";
import {useEffect, useState} from "react";

export function Counter() {
	const [count, setCount] = useState(0);
	useEffect(() => {
		const interval = setInterval(() => {
			setCount((prevCount) => prevCount + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, []);
	return <Box>{count}</Box>;
}
