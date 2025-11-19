import React from "react";
import ReactDOM from "react-dom/client";

import * as Widgets from "./codex/Widgets";
import {Button} from "./phoenix/Button";
import {Stack, type StackProps} from "./phoenix/Stack";

import "./phoenix/phoenix.css";
import "./App.css";

import * as SixtySix from "./sixtysix/Router";

const Panel = ({children, ...props}: Omit<StackProps, "style">) => (
	<Stack {...props} style={{height: "100%"}}>
		{children}
	</Stack>
);

const Statusbar = () => (
	<div className="statusbar">
		<SixtySix.Router>
			{Object.values(Widgets).map((Widget) => {
				const statusbar = Widget.statusbar?.() || null;

				if (statusbar) {
					return (
						<SixtySix.Route key={Widget.name} path={`/${Widget.name}`}>
							{() => statusbar}
						</SixtySix.Route>
					);
				}

				return null;
			})}
		</SixtySix.Router>
	</div>
);

const Leftbar = () => (
	<Panel className="leftbar">
		<SixtySix.Router>
			{Object.values(Widgets).map((Widget) => {
				const leftbar = Widget.leftbar?.() || null;

				if (leftbar) {
					return (
						<SixtySix.Route key={Widget.name} path={`/${Widget.name}`}>
							{() => leftbar}
						</SixtySix.Route>
					);
				}

				return null;
			})}
		</SixtySix.Router>
		Leftbar
	</Panel>
);
const Rightbar = () => (
	<Panel className="rightbar">
		<SixtySix.Router>
			{Object.values(Widgets).map((Widget) => {
				const rightbar = Widget.rightbar?.() || null;

				if (rightbar) {
					return (
						<SixtySix.Route key={Widget.name} path={`/${Widget.name}`}>
							{() => rightbar}
						</SixtySix.Route>
					);
				}

				return null;
			})}
		</SixtySix.Router>
		Rightbar
	</Panel>
);

const LetsGo = () => (
	<div className="main dark">
		<Leftbar />
		<Stack fullWidth className="center">
			<Stack direction="horizontal" gap={8} padding={8}>
				<SixtySix.Router>
					{Object.values(Widgets).map((Widget) => {
						return (
							<SixtySix.Route key={Widget.name} path={`/${Widget.name}`}>
								{() => Widget.render()}
							</SixtySix.Route>
						);
					})}
					<SixtySix.Route path="/contact">
						{() => (
							//
							<Button color="jade">contact</Button>
						)}
					</SixtySix.Route>
				</SixtySix.Router>
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
					<a href="/home">Home</a>
				</li>
				<li>
					<a href="/about">About</a>
				</li>
				<li>
					<a href="/contact">Contact</a>
				</li>
				<SixtySix.Router>
					{Object.values(Widgets).map((Widget) => {
						const menubar = Widget.menubar?.() || null;

						if (menubar) {
							return (
								<SixtySix.Route key={Widget.name} path={`/${Widget.name}`}>
									{() => menubar}
								</SixtySix.Route>
							);
						}

						return null;
					})}
				</SixtySix.Router>
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
