function* range(start: number, end: number) {
	// Loop through the range
	for (let i = start; i <= end; i++) {
		// Yield the current value
		yield i;
	}
}

const arr = Array.from(range(1, 10));

console.log(arr);
