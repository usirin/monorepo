interface Widget {
	name: string;
	render: () => React.ReactNode;

	menubar?: () => React.ReactNode;
	leftbar?: () => React.ReactNode;
	rightbar?: () => React.ReactNode;
	statusbar?: () => React.ReactNode;
}

export const Home: Widget = {
	name: "home",
	render: () => <div>Welcome to the Home Widget!</div>,
	leftbar: () => <div>Home Leftbar Content</div>,
};

export const About: Widget = {
	name: "about",
	render: () => <div>Welcome to the About Widget!</div>,
	leftbar: () => <div>About Leftbar Content</div>,
	menubar: () => (
		<li>
			<a href="/home">Abuout menu</a>
		</li>
	),
};
