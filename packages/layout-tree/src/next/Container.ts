interface Window {
	tag: "window";
}

interface Container {
	tag: "container";
	id: string;
	window?: Window;
}
