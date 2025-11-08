import React from "react";
import ReactDOM from "react-dom/client";
import {Stack, type StackProps} from "./phoenix/Stack";

import "./phoenix/phoenix.css";
import "./App.css";
import {Button} from "./phoenix/Button";

const Panel = ({children, ...props}: Omit<StackProps, "style">) => (
	<Stack {...props} style={{height: "100%"}}>
		{children}
	</Stack>
);

const Statusbar = () => <div className="statusbar">statusbar</div>;
const Leftbar = () => <Panel className="leftbar">Leftbar</Panel>;
const Rightbar = () => <Panel className="rightbar">Rightbar</Panel>;

const LetsGo = () => (
	<div className="main dark">
		<Leftbar />
		<Stack fullWidth className="center">
			<Stack direction="horizontal" gap={8} padding={8}>
				<Button>gray</Button>
				<Button color="amber">amber</Button>
				<Button color="ruby">ruby</Button>
				<Button color="jade">jade</Button>
				<Button color="sky">sky</Button>
			</Stack>
		</Stack>
		<Rightbar />
	</div>
);

function Menubar() {
	return (
		<div className="menubar">
			<ul>
				<li>
					<a href="/">Home</a>
				</li>
				<li>
					<a href="/about">About</a>
				</li>
				<li>
					<a href="/contact">Contact</a>
				</li>
			</ul>
		</div>
	);
}

async function kickthefuckoff() {
	const rootEl = document.getElementById("root");

	const foo = (
		<React.StrictMode>
			<Menubar />
			<LetsGo />
			<Statusbar />
		</React.StrictMode>
	);
	if (rootEl) {
		const root = ReactDOM.createRoot(rootEl);
		root.render(foo);
	}
}

kickthefuckoff()
	.then(console.log.bind(console.log, "we fuckin did it"))
	.catch(console.error.bind(console.error, "houston we have a problem"));
